import { io } from "socket.io-client";
import { API_BASE_URL, getAccessToken } from "../api/client";

const getSocketUrl = () => {
  const configuredUrl = (import.meta.env.VITE_SOCKET_URL || "").trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");
  if (!API_BASE_URL) return "";
  return new URL(API_BASE_URL, window.location.origin).origin;
};

export const connectSocket = () => {
  const url = getSocketUrl();
  const token = getAccessToken();
  if (!url || !token) return null;

  return io(url, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
  });
};
