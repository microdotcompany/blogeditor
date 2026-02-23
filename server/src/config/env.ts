import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
  }
  return value;
};

export const env = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: required("CLIENT_URL"),
  SERVER_URL: required("SERVER_URL"),
  MONGODB_URI: required("MONGODB_URI"),
  GITHUB_CLIENT_ID: required("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: required("GITHUB_CLIENT_SECRET"),
  JWT_SECRET: required("JWT_SECRET"),
  FAL_KEY: process.env.FAL_KEY || "",
};
