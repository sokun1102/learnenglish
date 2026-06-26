import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const sessionSchema = new Schema(
  {
    _id: { type: String, required: true }, // Secure random hex token
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

// TTL Index: automatically delete document when expiresAt reaches current time
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDocument = InferSchemaType<typeof sessionSchema>;

export const SessionModel: Model<SessionDocument> =
  mongoose.models.Session ?? mongoose.model<SessionDocument>("Session", sessionSchema);
