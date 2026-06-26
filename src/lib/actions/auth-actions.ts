"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/models/user";
import { SessionModel } from "@/models/session";
import type { UserSession } from "@/types/user";

const SESSION_COOKIE_NAME = "ielts_session_token";

// Helper to hash passwords securely using Node.js crypto module
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

// Helper to verify passwords
function verifyPassword(password: string, salt: string, hash: string) {
  const checkHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return checkHash === hash;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionToken || !sessionToken.value) {
    return null;
  }
  try {
    await connectToDatabase();
    
    // Find session in database
    const session = await SessionModel.findById(sessionToken.value);
    if (!session) {
      return null;
    }
    
    // Check if session has expired
    if (session.expiresAt < new Date()) {
      await SessionModel.findByIdAndDelete(session._id);
      return null;
    }
    
    // Find matching user
    const user = await UserModel.findById(session.userId);
    if (!user) {
      return null;
    }
    
    // Check if user account is suspended
    if (user.status === "suspended") {
      await SessionModel.findByIdAndDelete(session._id);
      return null;
    }
    
    return {
      userId: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      role: user.role as any,
      avatarUrl: user.avatarUrl || undefined,
      targetBand: user.targetBand
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { success: false, error: "Email hoặc mật khẩu không chính xác." };
  }

  if (user.status === "suspended") {
    return { success: false, error: "Tài khoản của bạn đã bị khóa." };
  }

  const isCorrect = verifyPassword(password, user.salt, user.passwordHash);
  if (!isCorrect) {
    return { success: false, error: "Email hoặc mật khẩu không chính xác." };
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save session record to database
  await SessionModel.create({
    _id: token,
    userId: user._id,
    expiresAt
  });

  const userSession: UserSession = {
    userId: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    role: user.role as any,
    avatarUrl: user.avatarUrl || undefined,
    targetBand: user.targetBand
  };

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict",
      path: "/"
    }
  );

  return { success: true, user: userSession };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
  if (sessionToken && sessionToken.value) {
    try {
      await connectToDatabase();
      // Completely remove the session from MongoDB to invalidate it
      await SessionModel.findByIdAndDelete(sessionToken.value);
    } catch (error) {
      console.error("Error during session deletion in database:", error);
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: "student" | "admin" = "student"
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  await connectToDatabase();

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { success: false, error: "Email này đã được đăng ký sử dụng." };
  }

  const { salt, hash } = hashPassword(password);

  const user = await UserModel.create({
    email: email.toLowerCase(),
    passwordHash: hash,
    salt,
    displayName,
    role,
    targetBand: 6.0,
    status: "active"
  });

  // Generate secure random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Save session record to database
  await SessionModel.create({
    _id: token,
    userId: user._id,
    expiresAt
  });

  const userSession: UserSession = {
    userId: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    role: user.role as any,
    avatarUrl: user.avatarUrl || undefined,
    targetBand: user.targetBand
  };

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "strict",
      path: "/"
    }
  );

  return { success: true, user: userSession };
}
