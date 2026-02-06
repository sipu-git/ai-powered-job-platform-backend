import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["POST", "GET", "PUT", "DELETE"]
  })
);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    runtime: "lambda",
    timestamp: new Date().toISOString()
  });
});

export const mountRoutes = async () => {
  const { default: DocRoutes } = await import("./routes/career.routes");
  const { default: adminRoutes } = await import("./routes/admin.routes");

  app.use("/api/career", DocRoutes);
  app.use("/api/admin", adminRoutes);
};

export default app;
