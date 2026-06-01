import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000").transform(Number),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRE: z.string().default("30d"),
  CORS_ORIGINS: z.string().default('["http://localhost:5173"]'),
  COOKIE_DOMAIN: z.string().optional(),
  MAX_FILE_SIZE: z.string().default("5242880").transform(Number),
  UPLOAD_DIR: z.string().default("uploads"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

let corsOrigins: string[];
try {
  corsOrigins = JSON.parse(env.CORS_ORIGINS) as string[];
} catch {
  corsOrigins = ["http://localhost:5173"];
}

const config = {
  NODE_ENV: env.NODE_ENV,
  IS_DEV: env.NODE_ENV !== "production",
  PORT: env.PORT,
  MONGO_URI: env.MONGO_URI,
  JWT_SECRET: env.JWT_SECRET,
  JWT_EXPIRE: env.JWT_EXPIRE,
  CORS_ORIGINS: corsOrigins,
  COOKIE_DOMAIN: env.COOKIE_DOMAIN || undefined,
  MAX_FILE_SIZE: env.MAX_FILE_SIZE,
  UPLOAD_DIR: env.UPLOAD_DIR,
} as const;

if (config.IS_DEV) {
  if (!config.CORS_ORIGINS.includes("http://localhost:5173")) {
    config.CORS_ORIGINS.push("http://localhost:5173");
  }
  if (!config.CORS_ORIGINS.includes("http://localhost:5174")) {
    config.CORS_ORIGINS.push("http://localhost:5174");
  }
}

export default config;
