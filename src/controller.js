import { Flagsmith } from "flagsmith-nodejs";
import LaunchDarkly from "launchdarkly-node-server-sdk";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const flagsmith = new Flagsmith({
  environmentKey: process.env.FLAGSMITH_ENV,
});

export const flagSmith = async (req, res) => {
  try {
    const traits = { age: 42 };

    // Identify the user
    const flags = await flagsmith.getIdentityFlags(
      "Development_user_123456",
      traits
    );

    const flagKeys = [
      "new-feature-enabled",
      "dark-mode",
      "beta-dashboard",
      "ai-search",
      "opportunity-search",
    ];

    const results = {};
    for (const key of flagKeys) {
      results[key] = flags.getFeatureValue(key);
    }

    //     const identifier = 'delboy@trotterstraders.co.uk';
    // const traitList = { car_type: 'robin_reliant' };

    // const flags = await flagsmith.getIdentityFlags(identifier, traitList);
    // var showButton = flags.isFeatureEnabled('secret_button');
    // var buttonData = flags.getFeatureValue('secret_button');

    res.send(results);
  } catch (error) {
    console.error("Flagsmith error:", error);
    res.status(500).send("Error fetching feature flags");
  }
};

const ldClientProd = LaunchDarkly.init(
  process.env.LD_PRODUCTION_SERVER_SDK_KEY
);
const ldClientDev = LaunchDarkly.init(process.env.LD_DEV_SERVER_SDK_KEY);

[ldClientProd, ldClientDev].map((element) => {
  element
    .waitForInitialization()
    .then(() => console.log("✅ LaunchDarkly SDK initialized"))
    .catch((err) => console.error("❌ LaunchDarkly init failed:", err));
});

// const { key } = req.query;
const user = {
  key: "user-1", // or dynamic: req.user.id
  name: "Rakesh Kumar",
};

// List all feature flag keys you care about
const flagKeys = [
  "new-feature-enabled",
  "dark-mode",
  "beta-dashboard",
  "ai-search",
  "opportunity-search",
];

export const getAllDataForAdmin = async (req, res) => {
  try {
    const resultsDev = {};
    const resultProd = {};
    for (const key of flagKeys) {
      resultsDev[key] = await ldClientDev.variation(key, user, false);
    }
    for (const key of flagKeys) {
      resultProd[key] = await ldClientProd.variation(key, user, false);
    }
    const nameMap = {
      "dark-mode": "Dark Mode",
      "ai-search": "AI Search",
      "beta-dashboard": "Beta Dashboard",
      "new-feature-enabled": "New Home Page",
    };

    const finalArray = Object.keys(resultProd)
      .filter((flag) => flag !== "opportunity-search") // 🔍 Exclude
      .map((flag) => ({
        name: nameMap[flag] || flag,
        flagName: flag,
        dev: resultsDev[flag] === true,
        prod: resultProd[flag] === true,
      }));
    res.json(finalArray);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const launchDarkly = async (req, res) => {
  try {
    const { env } = req.query;
    console.log("rakesh", env);

    // Evaluate all flags in parallel
    const results = {};
    for (const key of flagKeys) {
      results[key] =
        env === "dev"
          ? await ldClientDev.variation(key, user, false)
          : await ldClientProd.variation(key, user, false);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleFlag = async (req, res) => {
  const { environment, value, flagName } = req.query;
  const environments =
    environment === "dev"
      ? { dev: { on: value === "true" ? true : false } }
      : { production: { on: value === "true" ? true : false } };
  console.log(environments, flagName);
  try {
    const response = await axios.patch(
      `https://app.launchdarkly.com/api/v2/flags/default/${flagName}`,
      {
        // changes applied to the "test" environment
        environments,
      },
      {
        headers: {
          Authorization: `api-66e4c4e9-9846-497f-ade7-ed633ffdc5b7`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "Flag updated", data: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
};
