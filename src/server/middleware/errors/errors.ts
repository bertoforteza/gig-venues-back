import type { NextFunction, Request, Response } from "express";
import debugCreator from "debug";
import chalk from "chalk";
import type CustomError from "../../../CustomError/CustomError";

export const notFoundError = (req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint not found" });
};

const debug = debugCreator("gig-venues:server:middleware:errors");

export const generalError = (
  error: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line no-unused-vars
  next: NextFunction
) => {
  debug(chalk.red(`Error ${error.message}`));
  const statusCode = error.statusCode ?? 500;
  const message = error.publicMessage || "Something went wrong";

  res.status(statusCode).json({ error: message });
};
