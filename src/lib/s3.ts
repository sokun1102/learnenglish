import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config";

/**
 * Shared S3/MinIO Client instance configured using our centralized config
 */
export const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey
  },
  region: config.s3.region,
  forcePathStyle: true // Crucial for MinIO/local storage to work correctly instead of trying virtual hosts
});
