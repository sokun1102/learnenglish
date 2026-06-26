import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const systemSettingsSchema = new Schema(
  {
    siteTitle: { type: String, required: true, default: "IELTS Practice Platform", trim: true },
    maintenanceMode: { type: Boolean, required: true, default: false },
    defaultGradingStrict: { type: Boolean, required: true, default: false },
    allowAnonymousPractice: { type: Boolean, required: true, default: true },
    minioBucketName: { type: String, required: true, default: "ielts-audio", trim: true }
  },
  { timestamps: true }
);

export type SystemSettingsDocument = InferSchemaType<typeof systemSettingsSchema>;

export const SystemSettingsModel: Model<SystemSettingsDocument> =
  mongoose.models.SystemSettings ??
  mongoose.model<SystemSettingsDocument>("SystemSettings", systemSettingsSchema);
