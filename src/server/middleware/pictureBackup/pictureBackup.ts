import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs/promises";
import type { NextFunction, Response } from "express";
import environment from "../../../loadEnvironment.js";
import type { CustomRequest, VenueStructure } from "../../types.js";
import CustomError from "../../../CustomError/CustomError.js";

const { supabaseUrl, supabaseKey, supabaseBucket } = environment;

const supabase = createClient(supabaseUrl, supabaseKey);

export const bucket = supabase.storage.from(supabaseBucket);

const pictureBackup = async (
  req: CustomRequest<
    Record<string, unknown>,
    Record<string, unknown>,
    VenueStructure
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const picturePath = path.join(
      "assets",
      "images",
      `${req.file.filename}${req.file.originalname}`
    );
    await fs.rename(
      path.join("assets", "images", req.file.filename),
      picturePath
    );

    const fileContent = await fs.readFile(picturePath);

    await bucket.upload(req.file.filename + req.file.originalname, fileContent);

    const {
      data: { publicUrl },
    } = bucket.getPublicUrl(req.file.filename + req.file.originalname);

    req.body.picture = picturePath;
    req.body.backupPicture = publicUrl;

    next();
  } catch (error: unknown) {
    const customError = new CustomError(
      (error as Error).message,
      400,
      "There was an error uploading the picture"
    );

    next(customError);
  }
};

export default pictureBackup;
