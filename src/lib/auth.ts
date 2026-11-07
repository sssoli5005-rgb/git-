
import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const COOKIE_NAME = "ekhtaberha_session";
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

type PasswordHash = { salt: string; hash: string };

function decodePasswordHash(value: string): PasswordHash | null {
  const separator = value.includes("$") ? "$" : ".";
  const [salt, hash] = value.split(separator);
  if (!salt || !hash) return null;
  return { salt, hash };
}

function normalizePassword(value: string): string {
  return value.normalize("NFKC")
    .replace(/^[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]+|[\s\u200e\u200f\u202a-\u202e\u2066-\u2069]+$/gu, "");
}

export function verifyPassword(password: string): boolean {
  const adminPassword = normalizePassword(process.env.ADMIN_PASSWORD ?? "");
  if (adminPassword) {
    const actual = createHash("sha256").update(normalizePassword(password)).digest();
    const expected = createHash("sha256").update(adminPassword).digest();
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  const storedHash = process.env.APP_PASSWORD_HASH ?? "";

  if (storedHash) {
    const stored = decodePasswordHash(storedHash);
    if (!stored) return false;

    try {
      const actual = scryptSync(password, stored.salt, 64);
      const expected = Buffer.from(stored.hash, "base64");
      return expected.length === actual.length &&
        timingSafeEqual(expected, actual);
    } catch {
      return false;
    }
  }

  return false;
}

export function hasAuthConfiguration(): boolean {
  return Boolean(
    process.env.APP_USERNAME &&
    (process.env.APP_PASSWORD_HASH || process.env.ADMIN_PASSWORD) &&
    process.env.APP_SESSION_SECRET
  );
}

function normalizeUsername(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu, "")
    .replace(/[\s\t\r\n]/gu, "")
    .replace(/[إأآٱ]/gu, "ا")
    .replace(/[ى]/gu, "ي")
    .replace(/([ا])\1+/gu, "$1")
    .trim();
}

export function verifyUsername(username: string): boolean {
  const configured = normalizeUsername(process.env.APP_USERNAME ?? "");
  const candidate = normalizeUsername(username);

  const a = createHash("sha256").update(configured).digest();
  const b = createHash("sha256").update(candidate).digest();

  return timingSafeEqual(a, b);
}

export function verifyCredentials(username: string, password: string): boolean {
  return hasAuthConfiguration() &&
    verifyUsername(username) &&
    verifyPassword(password);
}

function sessionSecret(): Buffer {
  return Buffer.from(process.env.APP_SESSION_SECRET ?? "", "utf8");
}

export function createSession(username: string): string {
  const sessionUsername = (process.env.APP_USERNAME ?? username).trim();

  const payload = Buffer.from(
    JSON.stringify({
      u: sessionUsername,
      i: randomBytes(16).toString("hex"),
      e: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function isValidSession(cookieHeader: string | null): boolean {
  if (!cookieHeader || !sessionSecret().length) return false;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return false;

  const token = cookie.slice(COOKIE_NAME.length + 1);
  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const payload = token.slice(0, separator);
  const suppliedSignature = Buffer.from(token.slice(separator + 1));
  const expectedSignature = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");

  const expected = Buffer.from(expectedSignature);

  if (
    suppliedSignature.length !== expected.length ||
    !timingSafeEqual(suppliedSignature, expected)
  ) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { u?: string; e?: number };

    return (
      parsed.u === process.env.APP_USERNAME?.trim() &&
      typeof parsed.e === "number" &&
      parsed.e > Date.now()
    );
  } catch {
    return false;
  }
}

export function sessionCookie(token: string): string {
  const expires = new Date(
    Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  ).toUTCString();

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}; Expires=${expires}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearedSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
