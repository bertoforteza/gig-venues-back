import type { NextFunction, Response } from "express";
import path from "path";
import sharp from "sharp";
import CustomError from "../../../CustomError/CustomError.js";
import type { CustomRequest } from "../../types";

const pictureResize = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { filename, originalname } = req.file;

  try {
    const picturePath = `${path.basename(
      originalname,
      path.extname(originalname)
    )}`;

    await sharp(path.join("assets", "images", filename))
      .resize(320, 160, { fit: "cover", position: "center" })
      .webp({ quality: 90 })
      .toFormat("webp")
      .toFile(path.join("assets", "images", `${picturePath}.webp`));

    req.file.filename = `${picturePath}.webp`;
    req.file.originalname = `${picturePath}.webp`;

    next();
  } catch {
    const resizeError = new CustomError(
      "Could not resize the picture",
      500,
      "There was an error uploading the picture"
    );
    next(resizeError);
  }
};

export default pictureResize;
