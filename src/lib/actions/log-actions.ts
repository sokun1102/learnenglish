"use server";

import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/models/audit-log";
import { getCurrentUser } from "./auth-actions";
import type { AuditLogEntry } from "@/types/user";

function serializeDocument<T>(doc: any): T {
  if (!doc) return null as T;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj._id = obj._id.toString();
    obj.id = obj._id;
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function createAuditLog(action: string, target: string): Promise<boolean> {
  await connectToDatabase();

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return false;
  }

  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  await AuditLogModel.create({
    adminId: currentUser.userId,
    adminEmail: currentUser.email,
    action,
    target,
    ipAddress
  });

  return true;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await connectToDatabase();

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Không có quyền truy cập nhật ký hệ thống.");
  }

  const logs = await AuditLogModel.find({}).sort({ timestamp: -1 }).limit(100);

  return logs.map((log) => serializeDocument<AuditLogEntry>(log));
}
