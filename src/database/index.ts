import "../loadEnvironment.js";
import chalk from "chalk";
import debugCreator from "debug";
import mongoose from "mongoose";

const debug = debugCreator("gig-venues:dataBase");

const connectDb = async (mongoDbUrl: string) => {
  try {
    await mongoose.connect(mongoDbUrl);
    debug(chalk.green("Connection to database was successfull"));
    mongoose.set("toJSON", {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return ret;
      },
    });
  } catch (error: unknown) {
    debug(chalk.red("Error on connection", (error as Error).message));
  }
};

export default connectDb;
