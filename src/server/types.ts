import type { Request } from "express";
import type * as core from "express-serve-static-core";
import type { JwtPayload } from "jsonwebtoken";
import type { InferSchemaType, Types } from "mongoose";
import type { userSchema } from "../database/models/User";
import type { venueSchema } from "../database/models/Venue";

export interface Credentials {
  username: string;
  password: string;
}

export interface RegisterData extends Credentials {
  email: string;
}

export interface UserTokenPayload extends JwtPayload {
  id: string;
  username: string;
}

export interface CustomRequest<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any
> extends Request<P, ResBody, ReqBody> {
  userId: string;
}

export type VenueStructure = InferSchemaType<typeof venueSchema>;

export type UserStructure = InferSchemaType<typeof userSchema>;

export interface LoggedUser extends UserStructure {
  _id: Types.ObjectId;
}

export interface VenueWithId extends VenueStructure {
  _id: string;
}
