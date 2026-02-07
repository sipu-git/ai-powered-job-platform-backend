import serverless from "serverless-http";
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import type { Request } from "express";

import app, { mountRoutes } from "./app";
import { connectDB } from "./configs/db.config";

let initialized = false;
let handler: any;

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!initialized) {
    console.log("⏳ Lambda cold start – initializing app");

    await connectDB();
    await mountRoutes();
    handler = serverless(app, {
      request: (req: Request, event: APIGatewayProxyEventV2) => {
        const stage = event.requestContext?.stage;
        if (stage && event.rawPath.startsWith(`/${stage}`)) {
          req.url = event.rawPath.replace(`/${stage}`, "") || "/";
        }
      }
    });

    initialized = true;
    console.log("✅ App fully initialized");
  }

  return handler(event, context);
};
