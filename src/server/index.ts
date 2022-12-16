import debugCreator from "debug";
import chalk from "chalk";
import type { Express } from "express";

const debug = debugCreator("gig-venues:server");

const startServer = async (app: Express, port: number) => {
  await new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      debug(chalk.green.bold(`Server is listening on port: ${port}`));
      resolve(server);
    });

    server.on("error", (error: Error) => {
      debug(chalk.red.bold(`There was an error in server: ${error.message}`));
      reject(error);
    });
  });
};

export default startServer;
