import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const questionResultSchema = new Schema(
  {
    questionId: { type: String, required: true },
    number: { type: Number, required: true },
    studentAnswer: { type: String, default: "" },
    correctAnswers: { type: [String], required: true, default: [] },
    isCorrect: { type: Boolean, required: true },
    isOverWordLimit: { type: Boolean, required: true },
    normalizedAnswer: { type: String, default: "" },
    explanation: { type: String, required: true }
  },
  { _id: false }
);

const attemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    testId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeTest",
      required: true,
      index: true
    },
    skill: { type: String, enum: ["reading", "listening"], required: true },
    answers: { type: Map, of: String, default: {} },
    total: { type: Number, required: true, min: 0 },
    correct: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    results: { type: [questionResultSchema], default: [] },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export type AttemptDocument = InferSchemaType<typeof attemptSchema>;

export const AttemptModel: Model<AttemptDocument> =
  mongoose.models.Attempt ?? mongoose.model<AttemptDocument>("Attempt", attemptSchema);
