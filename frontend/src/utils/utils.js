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
  
  // 1. Return absolute URLs as is (Cloudinary, Unsplash, Google, etc.)
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('data:'))) {
    return path;
  }

  // 2. Ensure we have a clean path without double slashes
  let cleanPath = typeof path === 'string' ? path.trim() : String(path);
  
  // 3. Auto-fix missing /uploads/ prefix for common local patterns
  // If it looks like a filename but doesn't have the uploads folder
  if (!cleanPath.includes('uploads') && (cleanPath.startsWith('bg_') || cleanPath.startsWith('livetv_') || cleanPath.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i))) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  }

  // 4. Ensure it starts with a leading slash for API_URL concatenation
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // 5. Prepend the API_URL
  return `${API_URL}${finalPath}`;
};
