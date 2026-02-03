/**
 * Shared types for EnvVault
 * Used by both web and api packages
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
  user?: User;
  createdAt: string;
}

// Workspace types
export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Environment types
export interface Environment {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  position: number;
  createdAt: string;
}

// Secret types (server-side representation)
export interface Secret {
  id: string;
  environmentId: string;
  keyHash: string;
  keyEncrypted: string;
  valueEncrypted: string;
  nonce: string;
  version: number;
  comment?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  orgId: string;
  userId?: string;
  action: "create" | "read" | "update" | "delete";
  resourceType: "secret" | "workspace" | "environment" | "org" | "member";
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// API error codes
export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
