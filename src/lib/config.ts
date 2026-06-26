/**
 * Centralized Application Configuration Manager
 */

const MONGODB_URI = process.env.MONGODB_URI;
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
const MINIO_BUCKET = process.env.MINIO_BUCKET;

// Validation for production environments
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  if (!MONGODB_URI) {
    console.warn("WARNING: MONGODB_URI is not set in production!");
  }
  if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    console.warn("WARNING: S3/MinIO environment variables are not fully set in production!");
  }
}

export const config = {
  isProd,
  mongodb: {
    uri: MONGODB_URI || "mongodb://localhost:27017/ielts_practice"
  },
  s3: {
    endpoint: MINIO_ENDPOINT || "http://localhost:9000",
    accessKey: MINIO_ACCESS_KEY || "minioadmin",
    secretKey: MINIO_SECRET_KEY || "minioadmin",
    bucket: MINIO_BUCKET || "ielts-audio",
    region: "us-east-1" // Default region for MinIO/local storage
  }
};
