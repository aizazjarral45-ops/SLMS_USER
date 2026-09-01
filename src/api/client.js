const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, "");
export const isApiConfigured = Boolean(API_BASE_URL);

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const AUTH_STORAGE_KEYS = [
  "slms_access_token",
  "slms_current_session",
  "slms_admin_session",
  "token",
  "user",
  "slms_user",
];

const clearAuthStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of AUTH_STORAGE_KEYS) storage.removeItem(key);
  }

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
};

const isAuthenticationRequest = (path) =>
  /\/auth\/(login|register|logout|password-reset)/.test(path);

const handleAuthenticationFailure = (status, path) => {
  if (![401, 403].includes(status) || isAuthenticationRequest(path)) return;
  if (!getAccessToken()) return;

  clearAuthStorage();
  const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.dispatchEvent(
    new CustomEvent("slms:session-expired", {
      detail: {
        message: "Your session has been expired. Please login again.",
        redirectTo: redirectTo === "/login" ? "/" : redirectTo,
        status,
      },
    }),
  );
};

export const getAccessToken = () =>
  window.localStorage.getItem("slms_access_token") ||
  window.sessionStorage.getItem("slms_access_token");

export const request = async (path, options = {}) => {
  if (!isApiConfigured) {
    throw new ApiError(
      "The API is not configured. Set VITE_API_BASE_URL to enable backend requests.",
    );
  }

  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    // Use string concatenation to avoid any interpolation being modified by tooling
    headers.set("Authorization", "Bearer " + token);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined || typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
    });
  } catch (e) {
    throw new ApiError("Unable to reach the API. Please try again.");
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    handleAuthenticationFailure(response.status, path);
    throw new ApiError(body?.message || "The request could not be completed.", {
      status: response.status,
      details: body,
    });
  }

  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data !== undefined
  ) {
    return body.data;
  }

  return body;
};
