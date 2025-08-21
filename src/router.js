import Express from "express";
import {
  flagSmith,
  getAllDataForAdmin,
  launchDarkly,
  toggleFlag,
} from "./controller.js";

const router = Express.Router();

router.get("/dashboard", flagSmith);
router.get("/features", launchDarkly);
router.get("/getAllData", getAllDataForAdmin);
router.get("/changeFlag", toggleFlag);
export default router;
