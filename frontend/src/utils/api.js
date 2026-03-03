import axios from "axios";
import { getStoredToken } from "./auth";

/*
  Production architecture:
  Browser -> madhvi.artify -> Nginx -> Backend (127.0.0.1:5000)

  So frontend must always call relative /api
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Automatically attach token if exists
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const withAuth = () => {
  const token = getStoredToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getImageUrl = (path = "") => {
  if (!path || typeof path !== "string") return "";

  const trimmedPath = path.trim();
  if (!trimmedPath) return "";

  if (trimmedPath.startsWith("data:image")) return trimmedPath;
  if (trimmedPath.startsWith("http")) return trimmedPath;

  const normalizedPath = trimmedPath.replace(/\\/g, "/");
  const withLeadingSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  return `${API_BASE_URL}${withLeadingSlash}`;
};