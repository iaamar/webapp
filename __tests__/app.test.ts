import request from "supertest";
import { app } from "../src/index";
import sequelize, { bootstrapDatabase } from "../src/database/connect";

let server: any;
let port: number;

beforeAll(async () => {
  await bootstrapDatabase(); // Bootstrap the database
});

afterEach(async () => {
  if (server) {
    server.close(); // Close the server after each test
  }
  await sequelize.sync({ force: true }); // Clear the database
});

afterAll(async () => {
  await sequelize.close(); // Close the database connection
});

describe("Test 1. Integration test for healthz api", () => {
  beforeAll(() => {
    server = app.listen(0); // Use dynamic port assignment
    port = server.address().port; // Get the dynamically assigned port
  });

  test("Test healthz route", async () => {
    const res = await request(app).get(`/healthz`);
    expect(res.statusCode).toEqual(200);
  });
});

describe("POST /v1/user - Create a new user", () => {
  beforeAll(() => {
    server = app.listen(0); // Use dynamic port assignment
    port = server.address().port; // Get the dynamically assigned port
  });

  test("should create a new user with valid input", async () => {
    const dummyUser = {
      email: "ama@gmail.com",
      password: "amar",
      first_name: "Amar",
      last_name: "Nagargoje",
    };

    const response = await request(app).post("/v1/user").send(dummyUser);
    expect(response.status).toBe(201);
  });
});