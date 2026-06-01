import mongoose from "mongoose";
import config from "./env.js";
import logger from "../utils/logger.js";

async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", false);

    if (config.IS_DEV) {
      mongoose.set("debug", false);
    }

    await mongoose.connect(config.MONGO_URI);

    const info = await mongoose.connection.db?.admin().serverInfo();

    logger.info("MongoDB connected successfully", {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      mongooseVersion: mongoose.version,
      mongodbVersion: info?.version,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection failed: ${error.message}`, {
        name: error.name,
        stack: error.stack,
      });
    } else {
      logger.error("MongoDB connection failed with unknown error", { error });
    }
    process.exit(1);
  }
}

export default connectDB;
