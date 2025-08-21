import Express from "express";
import * as dotenv from "dotenv";
import flagRoute from "./router.js";
import cors from "cors";

dotenv.config();
const app = Express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use("/flag", flagRoute);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});
