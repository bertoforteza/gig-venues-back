import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../../../CustomError/CustomError.js";
import environment from "../../../loadEnvironment.js";
import type { CustomRequest, UserTokenPayload } from "../../types";

const { jwtSecret } = environment;

const auth = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      const error = new CustomError(
        "Authorization header is missing",
        401,
        "Missing token"
      );
      next(error);
    }

    if (!authHeader.startsWith("Bearer")) {
      const error = new CustomError(
        "Missing Bearer in token",
        401,
        "Invalid token"
      );
      next(error);
    }

    const token = authHeader.replace(/^Bearer\s*/, "");

    const user = jwt.verify(token, jwtSecret) as UserTokenPayload;

    req.userId = user.id;
    next();
  } catch (error: unknown) {
    const authError = new CustomError(
      (error as Error).message,
      401,
      "Invalid token"
    );
    next(authError);
  }
};

export default auth;
