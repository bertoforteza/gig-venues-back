import CustomError from "./CustomError.js";

export const loginErrors = {
  userNotFound: new CustomError(
    "Incorrect username",
    401,
    "Incorrect username or password"
  ),

  incorrectPassword: new CustomError(
    "Incorrect password",
    401,
    "Incorrect username or password"
  ),
};

export const noVenuesFound = new CustomError(
  "No venues in the data base",
  404,
  "No venues found"
);

export const noVenueFoundById = new CustomError(
  "Venue not found",
  404,
  "Venue not found"
);
