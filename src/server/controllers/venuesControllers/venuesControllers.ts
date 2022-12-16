import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import CustomError from "../../../CustomError/CustomError.js";
import { noVenueFoundById } from "../../../CustomError/errors.js";
import Venue from "../../../database/models/Venue.js";
import type { CustomRequest, VenueStructure } from "../../types.js";

export const getVenues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let venues;

  const pageOptions = {
    page: +req.query.page || 0,
    limit: 5,
    minCapacity: +req.query.minCapacity,
    maxCapacity: +req.query.maxCapacity,
  };

  const countVenues: number = await Venue.countDocuments();

  const checkPage = (countVenues: number) => ({
    count: countVenues,
    isPreviousPage: pageOptions.page !== 0,
    isNextPage: countVenues >= pageOptions.limit * (pageOptions.page + 1),
    totalPages: Math.ceil(countVenues / pageOptions.limit),
  });

  try {
    if (pageOptions.maxCapacity) {
      venues = await Venue.find({
        capacity: {
          $gte: pageOptions.minCapacity,
          $lte: pageOptions.maxCapacity,
        },
      })
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit);

      const countFilteredVenues = await Venue.countDocuments({
        capacity: {
          $gte: pageOptions.minCapacity,
          $lte: pageOptions.maxCapacity,
        },
      });

      res.status(200).json({ ...checkPage(countFilteredVenues), venues });
      return;
    }

    venues = await Venue.find()
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit);

    res.status(200).json({ ...checkPage(countVenues), venues });
  } catch (error: unknown) {
    next(error);
  }
};

export const getUserVenues = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;

    const userVenues = await Venue.find({ owner: userId });

    res.status(200).json({ userVenues });
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      500,
      "Something went wrong"
    );
    next(customError);
  }
};

export const deleteVenue = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { venueId } = req.params;

  try {
    const venueToDelete = await Venue.findByIdAndDelete(venueId, {
      owner: userId,
    });

    res.status(200).json(venueToDelete);
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      404,
      "Venue not found"
    );
    next(customError);
  }
};

export const createVenue = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const {
    address,
    backupPicture,
    capacity,
    city,
    email,
    indoor,
    name,
    phoneNumber,
    picture,
    description,
  } = req.body as VenueStructure;

  try {
    const newVenue: VenueStructure = {
      address,
      backupPicture,
      capacity,
      city,
      email,
      indoor,
      name,
      phoneNumber,
      picture,
      owner: new mongoose.Types.ObjectId(userId),
      description,
    };

    const newCreatedVenue = await Venue.create(newVenue);

    res.status(201).json(newCreatedVenue);
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      500,
      "There was an error creating the venue"
    );

    next(customError);
  }
};

export const getVenueById = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { venueId } = req.params;

  try {
    const venue = await Venue.findById(venueId);

    if (!venue) {
      next(noVenueFoundById);
      return;
    }

    res.status(200).json(venue);
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      400,
      "Venue not found"
    );
    next(customError);
  }
};
