export type LoginInput = {
  login: string;
  password: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type RegisterInput = {
  login: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  socialId: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type SessionContext = {
  id: string;
  accountId: number;
  login: string;
  expiresAt: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type AuthAuditEvent = {
  eventType: string;
  login: string;
  accountId?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  detail?: string | null;
};
