import environment from "./loadEnvironment.js";
import connectDb from "./database/index.js";
import startServer from "./server/index.js";
import app from "./server/app.js";

const { mongoDbUrl, port } = environment;

await connectDb(mongoDbUrl);
await startServer(app, +port);
