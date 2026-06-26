import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const evidenceSchema = new Schema(
  {
    passageIndex: Number,
    text: { type: String, required: true },
    timestampStart: Number,
    timestampEnd: Number
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    blankId: String,
    prompt: String,
    answers: { type: [String], required: true, default: [] },
    maxWords: Number,
    explanation: { type: String, required: true },
    evidence: evidenceSchema,
    strict: { type: Boolean, default: false }
  },
  { _id: false }
);

const questionGroupSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true
    },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    body: String,
    questions: { type: [questionSchema], default: [] }
  },
  { _id: false }
);

const mediaRefSchema = new Schema(
  {
    mediaAssetId: { type: Schema.Types.ObjectId, ref: "MediaAsset" },
    objectKey: String,
    bucket: String,
    storageProvider: String
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    passage: String,
    transcript: String,
    audio: mediaRefSchema,
    questionGroups: { type: [questionGroupSchema], default: [] }
  },
  { _id: false }
);

const practiceTestSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coverImage: { type: String, trim: true }, // URL or path to cover thumbnail
    skill: { type: String, required: true },
    testType: {
      type: String,
      required: true,
      default: "practice"
    },
    level: {
      type: String,
      required: true
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      default: "draft",
      index: true
    },
    tags: { type: [String], default: [], index: true },
    sections: { type: [sectionSchema], default: [] }
  },
  { timestamps: true }
);

export type PracticeTestDocument = InferSchemaType<typeof practiceTestSchema>;

export const PracticeTestModel: Model<PracticeTestDocument> =
  mongoose.models.PracticeTest ??
  mongoose.model<PracticeTestDocument>("PracticeTest", practiceTestSchema);
