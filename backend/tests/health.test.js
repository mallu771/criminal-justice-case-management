import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("../src/config/db.js", () => ({
  connectDatabase: async () => {},
}));

const { createApp } = await import("../src/app.js");

test("GET /health returns status ok", async () => {
  const app = await createApp();

  const response = await request(app).get("/health");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok" });
});