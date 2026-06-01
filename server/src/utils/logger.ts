import winston from "winston";
import path from "path";
import config from "../config/env.js";

const LOG_DIR = "logs";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

function createLogger(): winston.Logger {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat,
      level: config.IS_DEV ? "debug" : "info",
    }),
  ];

  if (!config.IS_DEV) {
    transports.push(
      new winston.transports.File({
        filename: path.join(LOG_DIR, "error.log"),
        level: "error",
        maxsize: 50 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
      }),
      new winston.transports.File({
        filename: path.join(LOG_DIR, "combined.log"),
        maxsize: 50 * 1024 * 1024,
        maxFiles: 5,
        tailable: true,
      })
    );
  }

  return winston.createLogger({
    level: config.IS_DEV ? "debug" : "info",
    format: logFormat,
    defaultMeta: { service: "dhriti-enterprise" },
    transports,
  });
}

const logger = createLogger();

export default logger;
