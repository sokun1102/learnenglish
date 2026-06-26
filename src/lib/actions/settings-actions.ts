"use server";

import mongoose from "mongoose";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SystemSettingsModel, type SystemSettingsDocument } from "@/models/system-settings";
import { s3Client } from "@/lib/s3";

import { createAuditLog } from "./log-actions";

function serializeDocument<T>(doc: any): T {
  if (!doc) return null as T;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function getSystemSettings(): Promise<SystemSettingsDocument> {
  await connectToDatabase();
  let settings = await SystemSettingsModel.findOne();
  
  if (!settings) {
    settings = new SystemSettingsModel({
      siteTitle: "IELTS Practice Platform",
      maintenanceMode: false,
      defaultGradingStrict: false,
      allowAnonymousPractice: true,
      minioBucketName: "ielts-audio"
    });
  }
  
  return serializeDocument<SystemSettingsDocument>(settings);
}

export async function updateSystemSettings(
  data: Partial<SystemSettingsDocument>
): Promise<SystemSettingsDocument> {
  await connectToDatabase();
  
  const updated = await SystemSettingsModel.findOneAndUpdate(
    {},
    { $set: data },
    { upsert: true, new: true, runValidators: true }
  );

  // Trigger audit logging automatically
  await createAuditLog("Cập nhật cấu hình", `Tiêu đề: ${data.siteTitle || "không đổi"}`);
  
  return serializeDocument<SystemSettingsDocument>(updated);
}

export async function checkServicesHealth(): Promise<{
  dbStatus: "connected" | "error";
  s3Status: "connected" | "error";
  dbError?: string;
  s3Error?: string;
}> {
  let dbStatus: "connected" | "error" = "error";
  let s3Status: "connected" | "error" = "error";
  let dbError: string | undefined;
  let s3Error: string | undefined;

  // 1. Check MongoDB Connection
  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      dbStatus = "connected";
    } else {
      dbError = `Connection readyState is ${mongoose.connection.readyState}`;
    }
  } catch (error: any) {
    dbError = error.message || "Không thể kết nối đến MongoDB.";
  }

  // 2. Check S3/MinIO Connection
  try {
    await s3Client.send(new ListBucketsCommand({}));
    s3Status = "connected";
  } catch (error: any) {
    s3Error = error.message || "Không thể kết nối đến S3/MinIO.";
  }

  return {
    dbStatus,
    s3Status,
    dbError,
    s3Error
  };
}
