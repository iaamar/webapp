import request from "supertest";
import { app, startServer } from "../src/index";

let server: any;
beforeAll(async () => {
  server = await startServer();
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
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(dummyUser.email);
    expect(response.body.first_name).toBe(dummyUser.first_name);
    expect(response.body.last_name).toBe(dummyUser.last_name);
  });
});
