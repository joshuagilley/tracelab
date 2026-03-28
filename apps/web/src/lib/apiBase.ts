// In local dev VITE_API_BASE is empty and Vite proxies /api → localhost:8080.
// In production the Dockerfile bakes in the Cloud Run API service URL.
export const API_BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : '/api'
