import config from "./config/env.js";
import connectDB from "./config/db.js";
import createApp from "./app.js";
import logger from "./utils/logger.js";

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create and start Express app
  const app = createApp();

  app.listen(config.PORT, () => {
    logger.info(`🚀 Dhriti Enterprise server running on port ${config.PORT}`, {
      environment: config.NODE_ENV,
      port: config.PORT,
    });
  });
};

start().catch((error) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
