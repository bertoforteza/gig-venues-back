import type { NextFunction } from "express";
import fs from "fs/promises";
import CustomError from "../../../CustomError/CustomError";
import { getRandomVenue } from "../../../factories/venuesFactory";
import type { CustomRequest } from "../../types";
import pictureResize from "./pictureResize";

const newVenue = getRandomVenue();

const req: Partial<CustomRequest> = {
  body: newVenue,
};
const next = jest.fn() as NextFunction;

const file: Partial<Express.Multer.File> = {
  filename: "venuePicture",
  originalname: "venuePictureOriginalName",
};

let mockedFile = jest.fn();

beforeAll(async () => {
  await fs.writeFile("assets/images/testVenue", "testVenue");
});

afterAll(async () => {
  await fs.unlink("assets/images/testVenue");
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock("sharp", () => () => ({
  resize: jest.fn().mockReturnValue({
    webp: jest.fn().mockReturnValue({
      toFormat: jest.fn().mockReturnValue({
        toFile: mockedFile,
      }),
    }),
  }),
}));

describe("Given a pictureResize middleware", () => {
  describe("When it receives a request with a correct picture file", () => {
    test("Then it should resize the file and invoke next", async () => {
      const expectedPicture = "venuePictureOriginalName.webp";
      req.file = file as Express.Multer.File;

      await pictureResize(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalled();
      expect(req.file.filename).toStrictEqual(expectedPicture);
    });
  });

  describe("When it receives a request with an invalid picture file", () => {
    test("Then it should invoke next with a customError", async () => {
      mockedFile = jest.fn().mockRejectedValue(new Error());
      const expectedError = new CustomError(
        "Could not resize the picture",
        500,
        "There was an error uploading the picture"
      );

      await pictureResize(req as CustomRequest, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
