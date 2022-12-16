import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import bcrypt from "bcryptjs";
import connectDb from "../../../database";
import User from "../../../database/models/User";
import { getRandomUserRegister } from "../../../factories/usersFactory";
import app from "../../app";
import type { Credentials, RegisterData } from "../../types";

let server: MongoMemoryServer;
const registerData: RegisterData = getRandomUserRegister();
const notHashedPassword = registerData.password;
const salt = 10;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDb(server.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await server.stop();
});

beforeEach(async () => {
  const hashedPassword = await bcrypt.hash(notHashedPassword, salt);
  await User.create({ ...registerData, password: hashedPassword });
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Given a POST 'user/register' endpoint", () => {
  describe("When it receives a request with user register credentials which are not in the database", () => {
    test("Then it should return a response with status 201", async () => {
      const expectedStatus = 201;
      const userCredentials: RegisterData = getRandomUserRegister();

      await request(app)
        .post("/user/register")
        .send(userCredentials)
        .expect(expectedStatus);
    });
  });

  describe("When it receives a request with a username which is already registered in the database", () => {
    test("Then it should return a response with status 500 and message 'Error on registration'", async () => {
      const expectedStatus = 500;
      const expectedErrorMessage = "Error on registration";
      const existingUser: RegisterData = getRandomUserRegister();
      existingUser.username = registerData.username;

      const response = await request(app)
        .post("/user/register")
        .send(existingUser)
        .expect(expectedStatus);

      expect(response.body).toHaveProperty("error", expectedErrorMessage);
    });
  });
});

describe("Given a POST 'user/login' endpoint", () => {
  describe("When it receives a request with user login credentials, and the credentials are correct", () => {
    test("Then it should return a response with status 200", async () => {
      const loginCredentials: Credentials = {
        username: registerData.username,
        password: registerData.password,
      };
      const expectedStatus = 200;

      await request(app)
        .post("/user/login")
        .send(loginCredentials)
        .expect(expectedStatus);
    });
  });

  describe("When it receives a request with a correct username and an incorrect password", () => {
    test("Then it should return a response with status 401 and message 'Incorrect username or password'", async () => {
      const loginCredentials: Credentials = {
        username: registerData.username,
        password: "password",
      };
      const expectedStatus = 401;

      await request(app)
        .post("/user/login")
        .send(loginCredentials)
        .expect(expectedStatus);
    });
  });

  describe("When it receives a request with a wrong username", () => {
    test("Then it should return a response with status 401 and message 'Incorrect username or password", async () => {
      const wrongUser: RegisterData = getRandomUserRegister();
      const wrongLogin: Credentials = {
        username: wrongUser.username,
        password: wrongUser.password,
      };
      const expectedStatus = 401;

      await request(app)
        .post("/user/login")
        .send(wrongLogin)
        .expect(expectedStatus);
    });
  });
});
