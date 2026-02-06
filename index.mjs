import express from "express";
import cors from "cors";
import serverless from "serverless-http";

import DocRoutes from "./routes/career.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* Routes */
app.use("/api/career", DocRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export const handler = serverless(app);
