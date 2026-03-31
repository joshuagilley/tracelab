// In local dev VITE_API_BASE is empty and Vite proxies /api → localhost:8080.
// In production the Dockerfile bakes in the Cloud Run API service URL (no trailing slash).
const viteApi = import.meta.env.VITE_API_BASE
  ? String(import.meta.env.VITE_API_BASE).replace(/\/+$/, '')
  : ''
export const API_BASE = viteApi ? `${viteApi}/api` : '/api'
