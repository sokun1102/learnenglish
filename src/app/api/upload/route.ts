import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";
import { config } from "@/lib/config";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MediaAssetModel } from "@/models/media-asset";

export async function POST(request: Request) {
  try {
    const { fileName, mimeType, size, durationSeconds } = await request.json();

    if (!fileName || !mimeType || !size) {
      return NextResponse.json(
        { error: "Thiếu thông tin metadata bắt buộc của tệp." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    // Normalize filename to prevent URL issues
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]+/g, "_");
    const objectKey = `tests/audio/${uniqueId}-${safeName}`;
    const bucket = config.s3.bucket;

    // Generate S3 PUT Command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: mimeType
    });

    // Create Presigned URL (Expires in 1 hour)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Public download/stream URL for local MinIO setup
    const publicUrl = `${config.s3.endpoint}/${bucket}/${objectKey}`;

    // Create the DB record for the MediaAsset
    const mediaAsset = await MediaAssetModel.create({
      fileName,
      bucket,
      objectKey,
      mimeType,
      size,
      durationSeconds: durationSeconds || 0,
      storageProvider: "minio",
      publicUrl
    });

    return NextResponse.json({
      uploadUrl,
      objectKey,
      mediaAssetId: mediaAsset._id.toString(),
      publicUrl
    });
  } catch (error: any) {
    console.error("Error creating presigned URL and MediaAsset:", error);
    return NextResponse.json(
      { error: error.message || "Không thể khởi tạo phiên tải lên." },
      { status: 500 }
    );
  }
}
