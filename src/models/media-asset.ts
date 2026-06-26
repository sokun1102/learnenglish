import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    bucket: { type: String, required: true, trim: true },
    objectKey: { type: String, required: true, trim: true, index: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    durationSeconds: { type: Number, min: 0 },
    storageProvider: {
      type: String,
      enum: ["minio", "s3", "r2", "local"],
      required: true,
      default: "minio"
    },
    publicUrl: { type: String, trim: true }
  },
  { timestamps: true }
);

export type MediaAssetDocument = InferSchemaType<typeof mediaAssetSchema>;

export const MediaAssetModel: Model<MediaAssetDocument> =
  mongoose.models.MediaAsset ??
  mongoose.model<MediaAssetDocument>("MediaAsset", mediaAssetSchema);
