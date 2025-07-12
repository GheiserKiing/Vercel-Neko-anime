// File: backend/__tests__/login.test.js

const request = require("supertest");
const app     = require("../server");  // importa la app sin iniciar server.listen en test
require("dotenv").config();

describe("POST /api/login", () => {
  test("debe responder con un token con credenciales correctas", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("debe responder 401 con credenciales incorrectas", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ username: "wrong", password: "wrong" });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Usuario o contraseña incorrectos");
  });
});
