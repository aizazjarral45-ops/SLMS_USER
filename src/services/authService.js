import { isApiConfigured, request } from "../api/client";

const USERS_STORAGE_KEY = "slms_local_users";
const SESSION_STORAGE_KEY = "slms_current_session";
const RESET_STORAGE_KEY = "slms_password_reset";
const USER_DATA_STORAGE_KEYS = [
  "slms-shared-app-data",
  "personalData",
  "profileData",
  "contactData",
  "slms-academic-workspace",
  "slms-expenses",
  "slms-monthly-budgets",
  "slms-hostel-applications",
  "slms-complaints",
  "notifications",
  "reminders",
  "customNotifications",
  "aiSettings",
  "slms-copilot-messages",
  "slms-notification-creation-times",
  "slms_remember_me",
  "signupEmail",
  "slms_password_reset",
];

const normaliseEmail = (email = "") => email.trim().toLowerCase();

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const createId = (prefix) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const hashPassword = async (password) => {
  const source = new TextEncoder().encode(password);
  if (!globalThis.crypto?.subtle) return password;

  const hash = await globalThis.crypto.subtle.digest("SHA-256", source);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const normalizeUser = (user = {}) => {
  if (!user || typeof user !== "object") return user;
  const normalized = { ...user };
  if (!normalized.id && normalized._id) normalized.id = normalized._id;
  return normalized;
};

const saveSession = ({ token, refreshToken = null, sessionId = null, user, rememberMe }) => {
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;
  const normalizedUser = normalizeUser(user);
  const session = { token, refreshToken, sessionId, user: normalizedUser, createdAt: new Date().toISOString() };

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  storage.setItem("slms_access_token", token);
  otherStorage.removeItem(SESSION_STORAGE_KEY);
  otherStorage.removeItem("slms_access_token");
  return session;
};

const toSession = (payload, rememberMe) => {
  const response = payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
  const token = response?.accessToken || response?.token;
  const user = normalizeUser(response?.user);
  if (!token || !user)
    throw new Error("The authentication response is incomplete.");
  return saveSession({
    token,
    refreshToken: response?.refreshToken,
    sessionId: response?.sessionId,
    user,
    rememberMe,
  });
};

export const getStoredSession = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const session = JSON.parse(
        storage.getItem(SESSION_STORAGE_KEY) || "null",
      );
      if (session?.token && (session?.user?.id || session?.user?._id)) return session;
    } catch {
      // An invalid local session is treated as signed out.
    }
  }
  return null;
};

export const clearStoredSession = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem(SESSION_STORAGE_KEY);
    storage.removeItem("slms_access_token");
    storage.removeItem("slms_admin_session");
    storage.removeItem("token");
  }
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
};

export const clearUserDataStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of USER_DATA_STORAGE_KEYS) storage.removeItem(key);
  }
};

export const logout = async () => {
  const session = getStoredSession();
  try {
    if (isApiConfigured && session?.token) {
      await request("/auth/logout", {
        method: "POST",
        body: { sessionId: session.sessionId },
      });
    }
  } finally {
    clearStoredSession();
    clearUserDataStorage();
  }
};

export const register = async ({
  name,
  email,
  password,
  rememberMe = true,
}) => {
  const cleanName = name.trim();
  const cleanEmail = normaliseEmail(email);

  if (isApiConfigured) {
    const payload = await request("/auth/register", {
      method: "POST",
      body: { name: cleanName, email: cleanEmail, password },
    });
    return payload.accessToken || payload.token
      ? toSession(payload, rememberMe)
      : payload;
  }

  const users = readJson(USERS_STORAGE_KEY, []);
  if (users.some((user) => user.email === cleanEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: createId("student"),
    name: cleanName,
    email: cleanEmail,
    role: "student",
    createdAt: new Date().toISOString(),
  };
  const passwordHash = await hashPassword(password);
  window.localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify([...users, { ...user, passwordHash }]),
  );

  return { user };
};

export const login = async ({ email, password, rememberMe = true }) => {
  const cleanEmail = normaliseEmail(email);

  if (isApiConfigured) {
    const payload = await request("/auth/login", {
      method: "POST",
      body: { email: cleanEmail, password },
    });
    return toSession(payload, rememberMe);
  }

  const users = readJson(USERS_STORAGE_KEY, []);
  const user = users.find((entry) => entry.email === cleanEmail);
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    throw new Error("Incorrect email or password.");
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  const session = saveSession({
    token: createId("local-session"),
    user: safeUser,
    rememberMe,
  });
  return session;
};

export const beginPasswordReset = async (email) => {
  const cleanEmail = normaliseEmail(email);
  if (isApiConfigured) {
    await request("/auth/forgot-password", {
      method: "POST",
      body: { email: cleanEmail },
    });
    return { delivery: "email", email: cleanEmail };
  }

  const users = readJson(USERS_STORAGE_KEY, []);
  if (!users.some((user) => user.email === cleanEmail)) {
    throw new Error("No local account exists for this email.");
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  window.sessionStorage.setItem(
    RESET_STORAGE_KEY,
    JSON.stringify({
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    }),
  );
  return { delivery: "local", code };
};

export const verifyPasswordResetCode = async ({ email, code }) => {
  const cleanEmail = normaliseEmail(email);
  if (isApiConfigured) {
    const result = await request("/auth/verify-otp", {
      method: "POST",
      body: { email: cleanEmail, otp: code },
    });
    return result;
  }

  const reset = JSON.parse(
    window.sessionStorage.getItem(RESET_STORAGE_KEY) || "null",
  );
  if (
    !reset ||
    reset.email !== cleanEmail ||
    reset.code !== code ||
    reset.expiresAt < Date.now()
  ) {
    throw new Error("The verification code is invalid or has expired.");
  }
  return true;
};

export const resetPassword = async ({ email, code, resetToken, password }) => {
  const cleanEmail = normaliseEmail(email);
  if (isApiConfigured) {
    await request("/auth/reset-password", {
      method: "POST",
      body: { email: cleanEmail, resetToken, newPassword: password },
    });
  } else {
    await verifyPasswordResetCode({ email: cleanEmail, code });
    const users = readJson(USERS_STORAGE_KEY, []);
    const passwordHash = await hashPassword(password);
    window.localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(
        users.map((user) =>
          user.email === cleanEmail ? { ...user, passwordHash } : user,
        ),
      ),
    );
  }

  window.sessionStorage.removeItem(RESET_STORAGE_KEY);
};

export const cancelPasswordReset = () =>
  window.sessionStorage.removeItem(RESET_STORAGE_KEY);

export const getLoginHistory = async () => {
  if (!isApiConfigured) return [];
  const result = await request("/auth/login/history");
  return Array.isArray(result?.history) ? result.history : [];
};

export const changePassword = async ({
  email,
  currentPassword,
  newPassword,
}) => {
  const cleanEmail = normaliseEmail(email);
  if (isApiConfigured) {
    await request("/auth/change-password", {
      method: "POST",
      body: { email: cleanEmail, currentPassword, newPassword },
    });
    return true;
  }

  const users = readJson(USERS_STORAGE_KEY, []);
  const idx = users.findIndex((u) => u.email === cleanEmail);
  if (idx === -1) throw new Error("No local account for this email.");
  const user = users[idx];
  const currentHash = await hashPassword(currentPassword);
  if (user.passwordHash !== currentHash)
    throw new Error("Current password is incorrect.");
  const newHash = await hashPassword(newPassword);
  users[idx] = { ...user, passwordHash: newHash };
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return true;
};

export const deleteAccount = async ({ email, password }) => {
  if (isApiConfigured) {
    await request("/users/me", {
      method: "DELETE",
      body: { password },
    });
    clearStoredSession();
    clearUserDataStorage();
    return true;
  }

  const cleanEmail = normaliseEmail(email);
  if (!cleanEmail || !String(password || "").trim()) {
    throw new Error("Enter your current account password to confirm deletion.");
  }

  try {
    const users = readJson(USERS_STORAGE_KEY, []);
    const index = users.findIndex((u) => u.email === cleanEmail);
    if (index === -1) {
      throw new Error("No local account exists for this email.");
    }

    const user = users[index];
    const providedHash = await hashPassword(password);
    if (user.passwordHash !== providedHash) {
      throw new Error("Incorrect password. Account was not deleted.");
    }

    const remaining = users.filter((u) => u.email !== cleanEmail);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(remaining));
    clearStoredSession();

    const keysToRemove = [
      "slms-shared-app-data",
      "slms-academic-workspace",
      "slms-expenses",
      "slms-monthly-budgets",
      "slms-hostel-applications",
      "slms-complaints",
      "notifications",
      "reminders",
      "aiSettings",
      "slms-copilot-messages",
      "personalData",
      "profileData",
      "contactData",
      USERS_STORAGE_KEY,
      SESSION_STORAGE_KEY,
      "slms_access_token",
      RESET_STORAGE_KEY,
    ];
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete account.");
  }
};
