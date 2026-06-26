import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    salt: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      required: true
    },
    avatarUrl: { type: String, trim: true },
    targetBand: { type: Number, default: 6.0, required: true, min: 1, max: 9 },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true
    },
    providers: {
      type: [Schema.Types.Mixed],
      default: []
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", userSchema);
