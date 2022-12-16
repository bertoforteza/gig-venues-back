import type { NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../../../CustomError/CustomError";
import type { CustomRequest } from "../../types";
import auth from "./auth";

beforeEach(() => {
  jest.clearAllMocks();
});
const req: Partial<CustomRequest> = {};

const next = jest.fn();

describe("Given the auth middleware", () => {
  describe("When it receives a request with a header Authorization with the token 'Bearer 1234'", () => {
    test("Then next function should be invoked", () => {
      const expectedId = { userId: "1234" };
      const token = "Bearer 1234";
      req.header = jest.fn().mockReturnValue(token);
      jwt.verify = jest.fn().mockReturnValueOnce(expectedId);

      auth(req as CustomRequest, null, next as NextFunction);

      expect(req).toHaveProperty("userId");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("When it receives a request with no Authorization header", () => {
    test("Then next function should be invoked with a Custom error with status 401 and public message 'Missing token'", () => {
      const customError = new CustomError(
        "Authorization header is missing",
        401,
        "Missing token"
      );
      req.header = jest.fn().mockReturnValue(undefined);

      auth(req as CustomRequest, null, next as NextFunction);

      expect(next).toHaveBeenCalledWith(customError);
    });
  });

  describe("When it receives a request with a header Authorization with the token '1234'", () => {
    test("The next function should be invoked with a Custom error with status 401 and a public message 'Invalid token'", () => {
      const customError = new CustomError(
        "Missing Bearer in token",
        401,
        "Invalid token"
      );
      req.header = jest.fn().mockReturnValue("1234");

      auth(req as CustomRequest, null, next as NextFunction);

      expect(next).toHaveBeenCalledWith(customError);
    });
  });
});
