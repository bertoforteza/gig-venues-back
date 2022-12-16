import { faker } from "@faker-js/faker";
import { Factory } from "fishery";
import mongoose from "mongoose";
import type { VenueStructure } from "../server/types";

const venuesFactory = Factory.define<VenueStructure>(() => ({
  address: faker.address.direction(),
  capacity: faker.datatype.number(5000),
  city: faker.address.cityName(),
  email: faker.internet.email(),
  indoor: faker.datatype.boolean(),
  name: faker.name.fullName(),
  owner: new mongoose.Types.ObjectId(),
  phoneNumber: faker.phone.number(),
  picture: faker.image.nightlife(),
  backupPicture: faker.image.nightlife(),
  _id: new mongoose.Types.ObjectId(),
  description: faker.lorem.paragraph(),
}));

export const getRandomVenuesList = (number: number) =>
  venuesFactory.buildList(number);

export const getRandomVenue = () => venuesFactory.build();
