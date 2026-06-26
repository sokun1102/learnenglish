"use server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { AttemptModel } from "@/models/attempt";
import { UserModel } from "@/models/user";
import { PracticeTestModel } from "@/models/practice-test";

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  avatarInitial: string;
  bestBand: string;
  totalAttempts: number;
  rank: number;
};

export type RecentActivity = {
  displayName: string;
  avatarInitial: string;
  action: string;
  testTitle: string;
  skill: string;
  band: string;
  timeAgo: string;
};

export type TestAttemptCount = {
  testId: string;
  count: number;
};

export type DashboardData = {
  leaderboard: LeaderboardEntry[];
  recentActivity: RecentActivity[];
  attemptCounts: TestAttemptCount[];
};

/** Convert percentage to IELTS Band */
function percentageToBand(pct: number): string {
  if (pct >= 90) return "9.0";
  if (pct >= 85) return "8.5";
  if (pct >= 78) return "8.0";
  if (pct >= 70) return "7.5";
  if (pct >= 62) return "7.0";
  if (pct >= 53) return "6.5";
  if (pct >= 45) return "6.0";
  if (pct >= 35) return "5.5";
  if (pct >= 25) return "5.0";
  if (pct >= 15) return "4.5";
  return "4.0";
}

/** Format relative time */
function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export async function getDashboardData(): Promise<DashboardData> {
  await connectToDatabase();

  // ── 1. Attempt counts per test ──────────────────────────────────
  const attemptCounts: TestAttemptCount[] = await AttemptModel.aggregate([
    { $group: { _id: "$testId", count: { $sum: 1 } } },
    { $project: { testId: { $toString: "$_id" }, count: 1, _id: 0 } }
  ]);

  // ── 2. Leaderboard: best band per user ─────────────────────────
  const userBests = await AttemptModel.aggregate([
    { $match: { userId: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$userId",
        bestPct: { $max: "$percentage" },
        totalAttempts: { $sum: 1 }
      }
    },
    { $sort: { bestPct: -1 } },
    { $limit: 5 }
  ]);

  const userIds = userBests.map((b) => b._id);
  const users = await UserModel.find({ _id: { $in: userIds } }).select(
    "_id displayName"
  );
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const leaderboard: LeaderboardEntry[] = userBests.map((b, idx) => {
    const user = userMap.get(b._id?.toString() ?? "");
    const name = user?.displayName ?? "Học viên";
    return {
      userId: b._id?.toString() ?? "",
      displayName: name,
      avatarInitial: name.charAt(0).toUpperCase(),
      bestBand: percentageToBand(b.bestPct),
      totalAttempts: b.totalAttempts,
      rank: idx + 1
    };
  });

  // ── 3. Recent activity: last 6 attempts ──────────────────────
  const recentAttempts = await AttemptModel.find()
    .sort({ submittedAt: -1 })
    .limit(6);

  const actUserIds = recentAttempts
    .map((a) => a.userId)
    .filter(Boolean);
  const actTestIds = recentAttempts.map((a) => a.testId);

  const [actUsers, actTests] = await Promise.all([
    UserModel.find({ _id: { $in: actUserIds } }).select("_id displayName"),
    PracticeTestModel.find({ _id: { $in: actTestIds } }).select("_id title skill")
  ]);

  const actUserMap = new Map(actUsers.map((u) => [u._id.toString(), u]));
  const actTestMap = new Map(actTests.map((t) => [(t as any)._id.toString(), t]));

  const recentActivity: RecentActivity[] = recentAttempts.map((attempt) => {
    const user = attempt.userId
      ? actUserMap.get(attempt.userId.toString())
      : null;
    const test = actTestMap.get(attempt.testId.toString());
    const name = user?.displayName ?? "Học viên ẩn danh";
    const band = percentageToBand(attempt.percentage);
    const skillLabel = attempt.skill === "reading" ? "Reading" : "Listening";
    return {
      displayName: name,
      avatarInitial: name.charAt(0).toUpperCase(),
      action: `hoàn thành bài ${skillLabel} — Band ${band}`,
      testTitle: (test as any)?.title ?? "Bài thi IELTS",
      skill: attempt.skill,
      band,
      timeAgo: timeAgo(new Date(attempt.submittedAt ?? attempt.createdAt ?? Date.now()))
    };
  });

  return {
    leaderboard,
    recentActivity,
    attemptCounts
  };
}
