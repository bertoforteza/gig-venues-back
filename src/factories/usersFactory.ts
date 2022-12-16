import { Factory } from "fishery";
import type { LoggedUser, RegisterData } from "../server/types";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

const userRegisterFactory = Factory.define<RegisterData>(() => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
}));

const loggedUserFactory = Factory.define<LoggedUser>(() => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  _id: new mongoose.Types.ObjectId(),
}));

export const getRandomUserRegister = () => userRegisterFactory.build();
export const getRandomLoggedUser = () => loggedUserFactory.build();
