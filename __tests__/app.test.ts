import request from "supertest";
import { app } from "../src/index";
import sequelize, { bootstrapDatabase } from "../src/database/connect";
import { User } from "../src/models/User";

let server: any;

beforeAll(async () => {
  await bootstrapDatabase(); // Bootstrap the database
});

afterAll(async () => {
  await sequelize.close(); // Close DB connection
  server.close(); // Close server
});

beforeEach(() => {
  server = app.listen(0); // Start a new server instance for each test
});

afterEach(() => {
  server.close(); // Ensure server is stopped after each test
});

describe("Test Suite", () => {
  test("Health Check API", async () => {
    const res = await request(app).get("/healthz");
    expect(res.statusCode).toEqual(200);
  });

  test("Create User", async () => {
    const user = {
      email: "test@example.com",
      password: "password",
      first_name: "Test",
      last_name: "User",
    };

    const res = await request(app).post("/v1/user").send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(user.email);
  });
});
