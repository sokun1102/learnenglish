"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { PracticeTestModel } from "@/models/practice-test";
import type { IELTSPracticeTest } from "@/types/ielts";

import { config } from "@/lib/config";

/**
 * Helper to serialize Mongoose document into a plain JS object
 */
function serializeDocument<T>(doc: any): T {
  if (!doc) return null as T;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert _id to string if it exists
  if (obj._id) {
    obj._id = obj._id.toString();
  }

  // Populate publicUrl if missing or empty
  if (obj.sections && Array.isArray(obj.sections)) {
    obj.sections.forEach((section: any) => {
      if (section.audio && (!section.audio.publicUrl || section.audio.publicUrl === "")) {
        if (section.audio.bucket && section.audio.objectKey) {
          section.audio.publicUrl = `${config.s3.endpoint}/${section.audio.bucket}/${section.audio.objectKey}`;
        }
      }
    });
  }
  
  // Deep serialization to remove any Mongoose internal structures and convert Dates to strings
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function getTests(): Promise<IELTSPracticeTest[]> {
  await connectToDatabase();
  const tests = await PracticeTestModel.find({ status: { $ne: "archived" } }).sort({ createdAt: -1 });
  return tests.map((t) => serializeDocument<IELTSPracticeTest>(t));
}

export async function getTestById(id: string): Promise<IELTSPracticeTest | null> {
  await connectToDatabase();
  const test = await PracticeTestModel.findOne({ id });
  if (!test) return null;
  return serializeDocument<IELTSPracticeTest>(test);
}

import { createAuditLog } from "./log-actions";

export async function createOrUpdateTest(testData: Partial<IELTSPracticeTest>): Promise<IELTSPracticeTest> {
  await connectToDatabase();

  const id = testData.id || `test_${Date.now()}`;
  
  const payload = {
    ...testData,
    id,
    status: testData.status || "draft",
    testType: testData.testType || "practice",
    level: testData.level || "band_5_6",
    durationMinutes: testData.durationMinutes || 20,
    tags: testData.tags || [],
    sections: testData.sections || []
  };

  const updatedTest = await PracticeTestModel.findOneAndUpdate(
    { id },
    payload,
    { new: true, upsert: true }
  );

  // Trigger audit logging automatically
  await createAuditLog("Lưu đề thi", `Mã đề: ${id} (${testData.title || "không tên"})`);

  return serializeDocument<IELTSPracticeTest>(updatedTest);
}

export async function deleteTest(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await PracticeTestModel.deleteOne({ id });
  await createAuditLog("Xóa đề thi", `Mã đề: ${id}`);
  return result.deletedCount > 0;
}

export async function toggleTestStatus(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<boolean> {
  await connectToDatabase();
  const result = await PracticeTestModel.updateOne({ id }, { $set: { status } });
  await createAuditLog("Thay đổi trạng thái đề thi", `Mã đề: ${id} -> ${status}`);
  return result.modifiedCount > 0;
}

export async function getAllTestsForAdmin(): Promise<IELTSPracticeTest[]> {
  await connectToDatabase();
  const tests = await PracticeTestModel.find({}).sort({ createdAt: -1 });
  return tests.map((t) => serializeDocument<IELTSPracticeTest>(t));
}
