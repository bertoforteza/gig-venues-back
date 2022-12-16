import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import CustomError from "../../../CustomError/CustomError";
import { noVenueFoundById } from "../../../CustomError/errors";
import Venue from "../../../database/models/Venue";
import { getRandomLoggedUser } from "../../../factories/usersFactory";
import {
  getRandomVenue,
  getRandomVenuesList,
} from "../../../factories/venuesFactory";
import type { CustomRequest, VenueWithId } from "../../types";
import {
  createVenue,
  deleteVenue,
  getUserVenues,
  getVenueById,
  getVenues,
} from "./venuesControllers";

let req: Partial<CustomRequest> = {
  params: {},
  query: { page: "0" },
};

const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

const next = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const allVenuesList = getRandomVenuesList(2);

describe("Given a getVenues controller", () => {
  describe("When it receives a request", () => {
    test("Then it should return a response and call its method status with code 200 and its method json with a list of venues", async () => {
      const expectedStatus = 200;

      const expectedPage = {
        count: 2,
        isNextPage: false,
        isPreviousPage: false,
        totalPages: 1,
      };
      Venue.countDocuments = jest.fn().mockResolvedValueOnce(2);

      Venue.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(allVenuesList),
        }),
      });

      await getVenues(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({
        ...expectedPage,
        venues: allVenuesList,
      });
    });
  });

  describe("When it receives a request with a capaticy filter in its params", () => {
    test("Then it should return a response and call its method status with code 200 and its method json with the filtered list of venues", async () => {
      const expectedStatus = 200;
      req = { ...req, query: { minCapacity: "100", maxCapacity: "500" } };

      const expectedPage = {
        count: 2,
        isNextPage: false,
        isPreviousPage: false,
        totalPages: 1,
      };
      Venue.countDocuments = jest.fn().mockResolvedValueOnce(2);

      Venue.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue(allVenuesList),
        }),
      });

      Venue.countDocuments = jest.fn().mockResolvedValue(2);

      await getVenues(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({
        ...expectedPage,
        venues: allVenuesList,
      });
    });
  });

  describe("When it receives a request and Venues find rejects an error", () => {
    test("Then next function should be called with a general error", async () => {
      const expectedError = new Error();

      Venue.countDocuments = jest.fn().mockResolvedValueOnce(2);

      Venue.find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValueOnce(expectedError),
        }),
      });

      await getVenues(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a getMyVenues controller", () => {
  describe("When it receives a custom request with a userId", () => {
    test("Then it should return a response and call its method status with code 200 and its method json with a list of the user's venues", async () => {
      const expectedStatus = 200;
      const allVenuesList = getRandomVenuesList(10);
      const myVenuesList = [allVenuesList[1], allVenuesList[5]];

      Venue.find = jest.fn().mockReturnValue(myVenuesList);

      await getUserVenues(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({ userVenues: myVenuesList });
    });
  });

  describe("When it receives a custom request and Venues find rejects an error", () => {
    test("Then next function should be called with a Custom error with public message 'Something went wrong'", async () => {
      const expectedError = new CustomError(
        "Something went wrong",
        500,
        "Something went wrong"
      );
      Venue.find = jest.fn().mockRejectedValue(expectedError);

      await getUserVenues(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a deleteVenue controller", () => {
  describe("When it receives a request with a venueId from a user htat is the venue's owner", () => {
    test("Then it should return a response and call its method status with code 200 and its method json with the received venue", async () => {
      const expectedStatus = 200;
      const owner = getRandomLoggedUser();
      const venueToDelete = {
        ...(getRandomVenue() as VenueWithId),
        owner: owner._id,
      };
      const req: Partial<CustomRequest> = {
        userId: venueToDelete._id,
        params: { venueId: venueToDelete._id },
      };

      Venue.findByIdAndDelete = jest.fn().mockReturnValueOnce(venueToDelete);

      await deleteVenue(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(venueToDelete);
    });
  });

  describe("When it receives a request without any venueId", () => {
    test("Then next function should be called with a Custom error with public message 'Venue not found'", async () => {
      const owner = getRandomLoggedUser();
      const venueToDelete = {
        ...(getRandomVenue() as VenueWithId),
        owner: owner._id,
      };
      const expectedError = new CustomError(
        "Venue not found",
        404,
        "Venue not found"
      );
      const req: Partial<CustomRequest> = {
        userId: venueToDelete._id,
        params: { venueId: "" },
      };

      Venue.findByIdAndDelete = jest.fn().mockRejectedValueOnce(expectedError);

      await deleteVenue(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a createVenue controller", () => {
  const expectedStatus = 201;
  const newVenue = getRandomVenue();
  const req: Partial<CustomRequest> = {
    body: newVenue,
  };

  describe("When it receives a request with a correct venue information in it's body", () => {
    test("Then it should return a response and call it's status method with code 201 and it's json method with the new created venue", async () => {
      Venue.create = jest.fn().mockReturnValue(newVenue);

      await createVenue(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(newVenue);
    });
  });

  describe("When it receives a request with venue information in it's body and there is an error creating the new venue", () => {
    test("Then next function should be called with a Custom error with public message 'There was an error creating the venue'", async () => {
      const expectedError = new CustomError(
        "",
        500,
        "There was an error creating the venue"
      );

      Venue.create = jest.fn().mockRejectedValueOnce(expectedError);

      await createVenue(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("Given a getVenueById controller", () => {
  describe("When it receives a request with a venueId in it's body", () => {
    test("Then it should return a response and call its status method with 200 and its json method with the found venue", async () => {
      const expectedStatus = 200;
      const idToFind = new mongoose.Types.ObjectId();
      const venueToFind = getRandomVenue();
      req.params = { venueId: idToFind.toString() };

      Venue.findById = jest.fn().mockResolvedValueOnce(venueToFind);

      await getVenueById(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(venueToFind);
    });
  });

  describe("When it receives a request with a wrong venueId in it's body", () => {
    test("Then next function should be called with a noVenueFoundById error", async () => {
      const expectedError = noVenueFoundById;

      Venue.findById = jest.fn().mockResolvedValueOnce(undefined);

      await getVenueById(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When it receives a request without a venueId in it's body", () => {
    test("Then next function should be called with a customError", async () => {
      req.params = { venueId: "" };
      const expectedError = new CustomError(
        "Venue not found",
        400,
        "Venue not found"
      );

      Venue.findById = jest
        .fn()
        .mockRejectedValueOnce(new Error("Venue not found"));

      await getVenueById(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
