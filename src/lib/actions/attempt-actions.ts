"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { AttemptModel } from "@/models/attempt";
import { PracticeTestModel } from "@/models/practice-test";
import { scoreAttempt } from "@/lib/scoring";
import { getCurrentUser } from "@/lib/actions/auth-actions";
import type { AttemptResult, StudentAnswers } from "@/types/ielts";

function serializeDocument<T>(doc: any): T {
  if (!doc) return null as T;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function submitAttempt(
  testId: string,
  answers: StudentAnswers
): Promise<AttemptResult> {
  await connectToDatabase();

  const currentUser = await getCurrentUser();

  // Find the test by its custom string ID
  const testDoc = await PracticeTestModel.findOne({ id: testId });
  if (!testDoc) {
    throw new Error(`Test with ID ${testId} not found.`);
  }

  // Convert mongoose doc to plain object matching IELTSPracticeTest
  const testObj = serializeDocument<any>(testDoc);

  // Score the attempt using pure TypeScript logic
  const scoringResult = scoreAttempt(testObj, answers);

  // Save attempt to the database
  const attemptPayload = {
    userId: currentUser?.userId || undefined,
    testId: testDoc._id,
    skill: testDoc.skill as "reading" | "listening",
    answers,
    total: scoringResult.total,
    correct: scoringResult.correct,
    percentage: scoringResult.percentage,
    results: scoringResult.results
  };

  await AttemptModel.create(attemptPayload);

  return scoringResult;
}

export async function getStudentStats() {
  await connectToDatabase();

  const attempts = await AttemptModel.find({});
  
  if (attempts.length === 0) {
    return {
      accuracy: "0%",
      readingCount: "0",
      listeningCount: "0",
      duration: "0h 00m"
    };
  }

  // Calculate stats
  let totalPercentage = 0;
  let readingCount = 0;
  let listeningCount = 0;

  for (const attempt of attempts) {
    totalPercentage += attempt.percentage;
    if (attempt.skill === "reading") {
      readingCount++;
    } else if (attempt.skill === "listening") {
      listeningCount++;
    }
  }

  const averageAccuracy = Math.round(totalPercentage / attempts.length);

  // Calculate total duration (sum of duration of attempted tests)
  // Retrieve the tests for the attempts to find their duration
  const testIds = attempts.map((a) => a.testId);
  const tests = await PracticeTestModel.find({ _id: { $in: testIds } });
  const testDurations = new Map(tests.map((t) => [t._id.toString(), t.durationMinutes]));

  let totalMinutes = 0;
  for (const attempt of attempts) {
    const duration = testDurations.get(attempt.testId.toString()) ?? 15; // default 15 mins
    totalMinutes += duration;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationStr = `${hours}h ${minutes.toString().padStart(2, "0")}m`;

  return {
    accuracy: `${averageAccuracy}%`,
    readingCount: readingCount.toString(),
    listeningCount: listeningCount.toString(),
    duration: durationStr
  };
}
