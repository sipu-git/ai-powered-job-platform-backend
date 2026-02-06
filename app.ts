import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default app;
