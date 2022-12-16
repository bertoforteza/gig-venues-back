import express from "express";
import multer from "multer";
import path from "path";
import {
  createVenue,
  deleteVenue,
  getUserVenues,
  getVenueById,
  getVenues,
} from "../../controllers/venuesControllers/venuesControllers.js";
import auth from "../../middleware/auth/auth.js";
import pictureBackup from "../../middleware/pictureBackup/pictureBackup.js";
import pictureResize from "../../middleware/pictureResize/pictureResize.js";

// eslint-disable-next-line new-cap
const venuesRouter = express.Router();
const upload = multer({
  dest: path.join("assets", "images"),
  limits: {
    fileSize: 5000000,
  },
});

venuesRouter.get("/", getVenues);
venuesRouter.get("/my-venues", auth, getUserVenues);
venuesRouter.delete("/delete/:venueId", auth, deleteVenue);
venuesRouter.post(
  "/new-venue",
  auth,
  upload.single("picture"),
  pictureResize,
  pictureBackup,
  createVenue
);
venuesRouter.get("/:venueId", getVenueById);

export default venuesRouter;
