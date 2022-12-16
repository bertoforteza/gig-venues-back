import environment from "../../../loadEnvironment";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import connectDb from "../../../database";
import { getRandomLoggedUser } from "../../../factories/usersFactory";
import app from "../../app";
import type { UserTokenPayload, VenueWithId } from "../../types";
import { getRandomVenue } from "../../../factories/venuesFactory";
import Venue from "../../../database/models/Venue";
import User from "../../../database/models/User";

let server: MongoMemoryServer;
const { jwtSecret } = environment;

const user = getRandomLoggedUser();
const venue = { ...(getRandomVenue() as VenueWithId), owner: user._id };

const token = jwt.sign(
  { id: user._id.toString(), username: user.username } as UserTokenPayload,
  jwtSecret
);

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  await connectDb(server.getUri());

  await Venue.create(venue);
  await User.create(user);
});

afterAll(async () => {
  await User.deleteMany({});
  await Venue.deleteMany({});
  await mongoose.disconnect();
  await server.stop();
});

describe("Given a GET '/venues' endpoint", () => {
  describe("When it receives a request", () => {
    test("Then it should return a response with status 200", async () => {
      const expectedStatus = 200;

      await request(app).get("/venues").expect(expectedStatus);
    });
  });
});

describe("Given a GET '/venues/my-venues' endpoint", () => {
  describe("When it receives a request with a valid token", () => {
    test("Then it should return a response with status 200", async () => {
      const expectedStatus = 200;

      await request(app)
        .get("/venues/my-venues")
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .set({ Authorization: `Bearer ${token}` })
        .expect(expectedStatus);
    });
  });
});

describe("Given a DELETE '/venues/delete/:venueId' endpoint", () => {
  describe("When it receives a request with a valid token and a valid venueId", () => {
    test("Then it should return a response with status 200", async () => {
      const expectedStatus = 200;

      await request(app)
        .delete(`/venues/delete/${venue._id.toString()}`)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .set({ Authorization: `Bearer ${token}` })
        .expect(expectedStatus);
    });
  });
});

describe("Given a GET '/venues/:venueId' endpoint", () => {
  describe("When it receives a request with a valid token and a valid venueId", () => {
    test("Then it should return a reponse with status 200", async () => {
      const expectedStatus = 200;
      const venueToFind = getRandomVenue() as VenueWithId;
      await Venue.create(venueToFind);

      await request(app)
        .get(`/venues/${venueToFind._id.toString()}`)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        .set({ Authorization: `Bearer ${token}` })
        .expect(expectedStatus);
    });
  });
});
