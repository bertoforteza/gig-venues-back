import type { Response } from "express";
import type CustomError from "../../../CustomError/CustomError";
import { generalError, notFoundError } from "./errors";

beforeEach(() => {
  jest.clearAllMocks();
});
const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

describe("Given a notFoundError middleware", () => {
  describe("When it receives a response", () => {
    test("Then its status method should be invoked with 404 code and its json method should be invokes with 'Endpoint not found'", () => {
      const expectedStatus = 404;
      const expectedErrorResponse = {
        message: "Endpoint not found",
      };

      notFoundError(null, res as Response);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(expectedErrorResponse);
    });
  });
});

describe("Given a generalError middleware", () => {
  describe("When it reseives a response", () => {
    test("Then its status method should be invoked with 500 code and its json method should be invokes with 'Something went wrong'", () => {
      const expectedStatus = 500;
      const expectedErrorResponse = {
        error: "Something went wrong",
      };
      const error = new Error("");

      generalError(error as CustomError, null, res as Response, () => {});

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(expectedErrorResponse);
    });
  });
});
