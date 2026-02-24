import axios from "axios";
import { getStoredToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
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
  if (!path) return "";
  if (typeof path !== "string") return "";
  const trimmedPath = path.trim();
  if (!trimmedPath) return "";
  if (trimmedPath === "undefined" || trimmedPath === "null") return "";
  if (trimmedPath.startsWith("data:image")) return trimmedPath;
  if (trimmedPath.startsWith("http")) return trimmedPath;
  const normalizedPath = trimmedPath.replace(/\\/g, "/");
  const withLeadingSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;
  return `${API_BASE_URL}${withLeadingSlash}`;
};
