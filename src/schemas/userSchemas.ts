import { Joi } from "express-validation";

export const registerUserSchema = {
  body: Joi.object({
    username: Joi.string().min(5).required(),
    password: Joi.string().min(8).required(),
    email: Joi.string().required(),
  }),
};
