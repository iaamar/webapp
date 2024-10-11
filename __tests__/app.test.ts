import request from "supertest";
import { app, startServer } from "../src/index";
import sequelize from "../src/database/connect";

let server: any;
beforeAll(async () => {
  server = await startServer();
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

describe("Test 1. Integration test for healthz api", () => {
  test("Test healthz route", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toEqual(200);
  });
});

describe("POST /v1/user - Create a new user", () => {
  it("should create a new user with valid input", async () => {
    const dummyUser = {
      email: "ama@gmail.com",
      password: "amar",
      first_name: "Amar",
      last_name: "Nagargoje",
    };

    const response = await request(app).post("/v1/user").send(dummyUser);
    console.log(response.body);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(dummyUser.email);
    expect(response.body.first_name).toBe(dummyUser.first_name);
    expect(response.body.last_name).toBe(dummyUser.last_name);
  });
});
