export type UserRole = "student" | "admin";

export type UserSession = {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  targetBand?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  targetBand: number;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  target: string;
  ipAddress?: string;
  timestamp: string;
};
