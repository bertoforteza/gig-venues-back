import CustomError from "./CustomError";

describe("Given a CustomError class", () => {
  describe("When is instantiated with message 'Incorrect username', statusCode 401, and public message 'Incorrect username or password'", () => {
    test("Then it return a Custom error with the received properties and values", () => {
      const expectedError = {
        message: "Incorrect username",
        statusCode: 401,
        publicMessage: "Incorrect username or password",
      };

      const customError = new CustomError(
        expectedError.message,
        expectedError.statusCode,
        expectedError.publicMessage
      );

      expect(customError).toHaveProperty("message", expectedError.message);
      expect(customError).toHaveProperty(
        "statusCode",
        expectedError.statusCode
      );
      expect(customError).toHaveProperty(
        "publicMessage",
        expectedError.publicMessage
      );
    });
  });
});
