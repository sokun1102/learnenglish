"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/models/user";
import { AttemptModel } from "@/models/attempt";
import { PracticeTestModel } from "@/models/practice-test";
import { getCurrentUser } from "./auth-actions";
import type { UserSession } from "@/types/user";

export async function updateStudentProfile(data: {
  displayName?: string;
  targetBand?: number;
  avatarUrl?: string;
}): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  await connectToDatabase();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Bạn chưa đăng nhập." };
  }

  const updateFields: any = {};
  if (data.displayName !== undefined) updateFields.displayName = data.displayName;
  if (data.targetBand !== undefined) updateFields.targetBand = data.targetBand;
  if (data.avatarUrl !== undefined) updateFields.avatarUrl = data.avatarUrl;

  const updatedUser = await UserModel.findByIdAndUpdate(
    currentUser.userId,
    { $set: updateFields },
    { new: true }
  );

  if (!updatedUser) {
    return { success: false, error: "Không tìm thấy người dùng." };
  }

  const updatedSession: UserSession = {
    userId: updatedUser._id.toString(),
    email: updatedUser.email,
    displayName: updatedUser.displayName,
    role: updatedUser.role as any,
    avatarUrl: updatedUser.avatarUrl || undefined,
    targetBand: updatedUser.targetBand
  };

  return { success: true, user: updatedSession };
}

export async function getStudentAttemptHistory() {
  await connectToDatabase();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return [];
  }

  // Query attempts by this student
  const attempts = await AttemptModel.find({ userId: currentUser.userId }).sort({
    submittedAt: -1
  });

  const testIds = attempts.map((a) => a.testId);
  const tests = await PracticeTestModel.find({ _id: { $in: testIds } });
  const testMap = new Map(tests.map((t) => [t._id.toString(), t]));

  return attempts.map((a) => {
    const test = testMap.get(a.testId.toString());
    return {
      attemptId: a._id.toString(),
      testId: test ? test.id : "",
      testTitle: test ? test.title : "Bài thi không xác định",
      skill: a.skill,
      correct: a.correct,
      total: a.total,
      percentage: a.percentage,
      submittedAt: a.submittedAt.toISOString()
    };
  });
}
