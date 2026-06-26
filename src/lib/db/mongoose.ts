import mongoose from "mongoose";
import { PracticeTestModel } from "@/models/practice-test";
import { sampleTests } from "@/lib/sample-data";

import { config } from "@/lib/config";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = config.mongodb.uri;

  cached.promise ??= mongoose.connect(uri, {
    bufferCommands: false
  });

  cached.conn = await cached.promise;

  // Auto-seed database if empty
  try {
    const count = await PracticeTestModel.countDocuments();
    if (count === 0) {
      console.log("Database is empty. Seeding sample tests...");
      await PracticeTestModel.insertMany(sampleTests, { ordered: false });
      console.log("Seeding completed successfully!");
    }
  } catch (error: any) {
    if (error.code === 11000 || error.name === "MongoBulkWriteError" || error.message?.includes("E11000")) {
      console.log("Sample tests already seeded by another process.");
    } else {
      console.error("Error seeding sample tests:", error);
    }
  }

  return cached.conn;
}
