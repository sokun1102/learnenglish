import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    adminEmail: { type: String, required: true, lowercase: true, trim: true },
    action: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    ipAddress: { type: String, trim: true },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
      expires: 90 * 24 * 60 * 60 // 90 days TTL index
    }
  },
  { timestamps: false }
);

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel: Model<AuditLogDocument> =
  mongoose.models.AuditLog ??
  mongoose.model<AuditLogDocument>("AuditLog", auditLogSchema);
