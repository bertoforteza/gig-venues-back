import express from "express";
import { validate } from "express-validation";
import { registerUserSchema } from "../../../schemas/userSchemas.js";
import {
  loginUser,
  registerUser,
} from "../../controllers/userControllers/userControllers.js";

// eslint-disable-next-line new-cap
const userRouter = express.Router();

userRouter.post(
  "/register",
  validate(registerUserSchema, {}, { abortEarly: false }),
  registerUser
);
userRouter.post("/login", loginUser);

export default userRouter;
