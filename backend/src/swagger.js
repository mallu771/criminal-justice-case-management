export const openApiSpec = {
  openapi: "3.0.3",

  info: {
    title: "Justice Case Management API",
    version: "1.0.0",
    description: "Supporting REST endpoints for the case management application",
  },

  servers: [
    {
      url: "http://localhost:4000",
    },
  ],

  paths: {
    "/health": {
      get: {
        summary: "Check API health",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};