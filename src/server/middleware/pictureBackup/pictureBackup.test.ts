/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { NextFunction, Response } from "express";
import fs from "fs/promises";
import CustomError from "../../../CustomError/CustomError";
import { getRandomVenue } from "../../../factories/venuesFactory";
import type { CustomRequest } from "../../types";
import pictureBackup, { bucket } from "./pictureBackup";

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        bucket: () => ({
          getPublicUrl: () => ({
            publicUrl: "testFileName.webptestOriginalName.webp",
          }),
        }),
      }),
    },
  }),
}));

const fileRequest = {
  filename: "testFileName.webp",
  originalname: "testOriginalName.webp",
} as Partial<Express.Multer.File>;

const newVenue = getRandomVenue();

const req = {
  body: newVenue,
  file: fileRequest,
} as Partial<CustomRequest>;
const res = {} as Partial<Response>;
const next = jest.fn();

beforeEach(async () => {
  await fs.writeFile("assets/images/testFileName.webp", "testFileName");
  await fs.writeFile("assets/images/testOriginalName.webp", "testOriginalName");
});

afterAll(async () => {
  await fs.unlink("assets/images/testFileName.webptestOriginalName.webp");
  await fs.unlink("assets/images/testOriginalName.webp");
  jest.clearAllMocks();
});

describe("Given a pictureBackup middleware", () => {
  describe("When it receives a request with a file", () => {
    test("Then it should rename the file, upload it to supabase and invoke next", async () => {
      fs.readFile = jest.fn().mockResolvedValueOnce(newVenue.picture);
      bucket.upload = jest.fn();
      bucket.getPublicUrl = jest
        .fn()
        .mockReturnValueOnce({ data: { publicUrl: newVenue.picture } });

      await pictureBackup(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalled();
    });
  });

  describe("When it receives a request with a file and throws an error", () => {
    test("Then next should be invoked with a custom error", async () => {
      const customError = new CustomError(
        "Error uploading the picture",
        400,
        "There was an error uploading the picture"
      );
      fs.readFile = jest.fn().mockRejectedValue(customError);

      await pictureBackup(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(customError);
    });
  });
});
