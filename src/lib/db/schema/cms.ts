import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { datetime, index, int, mysqlTable, text, tinyint, varchar } from "drizzle-orm/mysql-core";

export const webSessions = mysqlTable(
  "web_sessions",
  {
    id: varchar("id", { length: 128 }).notNull().primaryKey(),
    accountId: int("account_id").notNull(),
    login: varchar("login", { length: 30 }).notNull(),
    ip: varchar("ip", { length: 255 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    lastSeenAt: datetime("last_seen_at", { mode: "string" }).notNull(),
    expiresAt: datetime("expires_at", { mode: "string" }).notNull(),
    revokedAt: datetime("revoked_at", { mode: "string" }),
  },
  (table) => [
    index("web_sessions_account_id_idx").on(table.accountId),
    index("web_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const authAuditLog = mysqlTable(
  "auth_audit_log",
  {
    id: int("id").autoincrement().notNull().primaryKey(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    login: varchar("login", { length: 30 }).notNull().default(""),
    accountId: int("account_id"),
    ip: varchar("ip", { length: 255 }),
    userAgent: varchar("user_agent", { length: 512 }),
    success: tinyint("success").notNull().default(0),
    detail: text("detail"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    index("auth_audit_log_event_type_idx").on(table.eventType),
    index("auth_audit_log_login_idx").on(table.login),
    index("auth_audit_log_created_at_idx").on(table.createdAt),
  ],
);

export type WebSession = InferSelectModel<typeof webSessions>;
export type NewWebSession = InferInsertModel<typeof webSessions>;
export type AuthAuditLogEntry = InferSelectModel<typeof authAuditLog>;
export type NewAuthAuditLogEntry = InferInsertModel<typeof authAuditLog>;
