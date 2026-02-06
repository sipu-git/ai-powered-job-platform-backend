import serverless from "serverless-http";
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import type { Request } from "express";

import app, { mountRoutes } from "./app";
import { connectDB } from "./configs/db.config";

let initialized = false;

const serverlessHandler = serverless(app, {
  request: (req: Request, event: APIGatewayProxyEventV2) => {
    const stage = event.requestContext?.stage;
    if (stage && event.rawPath.startsWith(`/${stage}`)) {
      req.url = event.rawPath.replace(`/${stage}`, "") || "/";
    }
  }
});

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!initialized && !event.rawPath.endsWith("/health")) {
    console.log("⏳ Initializing app (cold start)");
    await connectDB();
    await mountRoutes();
    initialized = true;
    console.log("✅ App initialized");
  }

  return serverlessHandler(event, context);
};
