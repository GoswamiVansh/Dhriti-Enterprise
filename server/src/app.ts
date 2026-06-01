import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import path from "path";
import fs from "fs";

import config from "./config/env.js";
import { limiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

function createApp() {
  const app = express();

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(mongoSanitize());

  // Rate limiting
  app.use(limiter);

  // CORS
  app.use(
    cors({
      origin: config.CORS_ORIGINS,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  if (config.IS_DEV) {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Static uploads
  const uploadDir = path.resolve(config.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use(`/${config.UPLOAD_DIR}`, express.static(uploadDir));

  // Health check
  app.get("/api/v1/health", (_req, res) => {
    res.json({
      status: "OK",
      message: "Dhriti Enterprise API is running",
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  const apiRouter = express.Router();
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/products", productRoutes);
  apiRouter.use("/categories", categoryRoutes);
  apiRouter.use("/cart", cartRoutes);
  apiRouter.use("/orders", orderRoutes);
  apiRouter.use("/reviews", reviewRoutes);
  apiRouter.use("/users", userRoutes);
  apiRouter.use("/admin", adminRoutes);
  apiRouter.use("/upload", uploadRoutes);

  app.use("/api/v1", apiRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
