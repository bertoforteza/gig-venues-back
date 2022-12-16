import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import CustomError from "../../../CustomError/CustomError.js";
import { loginErrors } from "../../../CustomError/errors.js";
import User from "../../../database/models/User.js";
import type {
  Credentials,
  RegisterData,
  UserTokenPayload,
} from "../../types.js";
import environment from "../../../loadEnvironment.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, username } = req.body as RegisterData;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });

    res.status(201).json({ user: { id: newUser._id, username, email } });
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      500,
      "Error on registration"
    );
    next(customError);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body as Credentials;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      next(loginErrors.userNotFound);
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      next(loginErrors.incorrectPassword);
      return;
    }

    const tokenPayload: UserTokenPayload = {
      username,
      id: user._id.toString(),
    };

    const token = jwt.sign(tokenPayload, environment.jwtSecret);

    res.status(200).json({ token });
  } catch (error: unknown) {
    next(error);
  }
};
