import cors from "cors";
import express from "express";
import morgan from "morgan";
import { generalError, notFoundError } from "./middleware/errors/errors.js";
import userRouter from "./routers/userRouter/userRouter.js";
import venuesRouter from "./routers/venuesRouter/venuesRouter.js";

const app = express();
app.use(cors());
app.disable("x-powered-by");

app.use(express.json());
app.use(morgan("dev"));

app.use("/user", userRouter);
app.use("/venues", venuesRouter);

app.use(notFoundError);
app.use(generalError);

export default app;
