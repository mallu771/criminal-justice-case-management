
import express from "express";
import cors from "cors";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs, resolvers } from "./graphql/schema.js";
import { getUserFromHeader } from "./auth.js";

import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./swagger.js";

export async function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    })
  );

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
    express.json({ limit: "1mb" }),
    expressMiddleware(apollo, {
      context: async ({ req }) => ({
        user: getUserFromHeader(req.headers.authorization),
      }),
    })
  );
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec)
);
  return app;
}
