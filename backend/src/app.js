
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs, resolvers } from "./graphql/schema.js";
import { getUserFromHeader } from "./auth.js";

import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./swagger.js";

export async function createApp() {
  const app = express();

  app.disable("x-powered-by");

  // Trust one reverse proxy: Nginx
  app.set("trust proxy", 1);

  // Add HTTP security headers
  app.use(helmet());

  // Allow requests only from the configured frontend
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // General API rate limit: 300 requests per 15 minutes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
  });

  await apollo.start();

  app.use(
    "/graphql",
    apiLimiter,
    express.json({ limit: "1mb" }),
    expressMiddleware(apollo, {
      context: async ({ req }) => ({
        user: getUserFromHeader(req.headers.authorization),
      }),
    })
  );

  // Keep Swagger available only outside production
  if (process.env.NODE_ENV !== "production") {
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec)
    );
  }

  return app;
}
