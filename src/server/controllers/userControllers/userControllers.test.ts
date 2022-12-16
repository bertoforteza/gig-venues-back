import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import CustomError from "../../../CustomError/CustomError";
import User from "../../../database/models/User";
import type { Credentials, RegisterData } from "../../types";
import { loginUser, registerUser } from "./userControllers";
import { loginErrors } from "../../../CustomError/errors";

const req: Partial<Request> = {};

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

const next = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const token = jwt.sign({}, "tokensecret");

describe("Given the registerUser controller", () => {
  describe("When it receives a request with username 'admin', password 'adminadmin' and email 'admin@admin.com'", () => {
    test("Then its method status should be invoked with code 201, and its method json with the user's data", async () => {
      const body: RegisterData = {
        username: "admin",
        password: "adminadmin",
        email: "admin@admin.com",
      };
      req.body = body;
      const expectedStatus = 201;
      const hashedPassword = "adminhash";
      const userId = new mongoose.Types.ObjectId();

      bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);
      User.create = jest.fn().mockResolvedValue({
        username: body.username,
        password: hashedPassword,
        email: body.email,
        _id: userId,
      });

      await registerUser(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          username: body.username,
          email: body.email,
          id: userId,
        },
      });
    });
  });

  describe("When it receives a request with an existing username", () => {
    test("Then its function next should be invoked with a CustomError", async () => {
      const body: RegisterData = {
        username: "admin",
        password: "adminadmin",
        email: "admin@admin.com",
      };
      req.body = body;
      const expectedCustomError = new CustomError(
        "Mongoose error",
        500,
        "Error on registration"
      );

      User.create = jest.fn().mockRejectedValue(new Error("Mongoose error"));

      await registerUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedCustomError);
    });
  });
});

describe("Given a loginUser controller", () => {
  describe("When it receives a request with username 'admin' and password 'adminadmin' in the body, and a response", () => {
    test("Then it should invoke response's status method with 200 and json with a token", async () => {
      const userCredentials: Credentials = {
        username: "admin",
        password: "adminadmin",
      };

      const userId = new mongoose.Types.ObjectId();
      const expectedStatus = 200;
      req.body = userCredentials;
      User.findOne = jest
        .fn()
        .mockResolvedValue({ ...userCredentials, _id: userId });
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue(token);

      await loginUser(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ token });
    });
  });

  describe("When it receives a request with username 'admin' and password 'admin', and the password is no correct", () => {
    test("Then it should invoke next with a CustomError with public message 'Incorrect username or password'", async () => {
      const userCredentials: Credentials = {
        username: "admin",
        password: "admin",
      };
      const userId = new mongoose.Types.ObjectId();
      req.body = userCredentials;
      User.findOne = jest
        .fn()
        .mockResolvedValueOnce({ ...userCredentials, _id: userId });
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await loginUser(req as Request, null, next as NextFunction);

      expect(next).toHaveBeenCalledWith(loginErrors.incorrectPassword);
    });
  });

  describe("When it receives a request with username 'johndoe' which is not registered in the data base", () => {
    test("Then it should invoke next with a CustomError with public message 'Incorrect username or password'", async () => {
      const userCredentials: Credentials = {
        username: "johndoe",
        password: "johndoe1234",
      };

      req.body = userCredentials;

      User.findOne = jest.fn().mockResolvedValue(null);

      await loginUser(req as Request, null, next as NextFunction);

      expect(next).toHaveBeenCalledWith(loginErrors.userNotFound);
    });
  });

  describe("When it receives a request and and bcrypt rejects", () => {
    test("Then it should invoke next with an error", async () => {
      const userCredentials: Credentials = {
        username: "admin",
        password: "adminadmin",
      };

      const userId = new mongoose.Types.ObjectId();
      req.body = userCredentials;
      User.findOne = jest
        .fn()
        .mockResolvedValue({ ...userCredentials, _id: userId });
      const expectedError = new Error();
      bcrypt.compare = jest.fn().mockRejectedValue(expectedError);

      await loginUser(req as Request, null, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
