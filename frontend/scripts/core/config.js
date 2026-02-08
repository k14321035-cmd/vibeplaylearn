export const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://vibeplaylearn.onrender.com";

export const API_BASE_URL = `${BACKEND_URL}/api`;


