import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_URL } from "../config"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Robustly resolves image URLs for the platform.
 * Handles local uploads, absolute URLs, and environment-specific API roots.
 */
export const resolveImageUrl = (path, fallback) => {
  if (!path || (typeof path === 'string' && path.trim() === '')) return fallback;
  
  // 1. Return absolute URLs as is
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('data:'))) {
    return path;
  }

  let cleanPath = typeof path === 'string' ? path.trim() : String(path);
  
  // 2. Auto-fix missing /uploads/
  if (!cleanPath.includes('uploads') && (cleanPath.startsWith('bg_') || cleanPath.startsWith('livetv_') || cleanPath.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i))) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  }

  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  // 3. Force Production URL if not on localhost
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? API_URL : 'https://smart-agri-platform.onrender.com';
  
  return `${base}${finalPath}`;
};
