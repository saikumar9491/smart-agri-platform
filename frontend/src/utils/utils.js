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
  
  let cleanPath = typeof path === 'string' ? path.trim() : String(path);

  // 1. Return absolute URLs as is EXCEPT for legacy localhost links
  if (cleanPath.startsWith('http') || cleanPath.startsWith('data:')) {
    if (cleanPath.includes('localhost') || cleanPath.includes('127.0.0.1')) {
      // Strip the host part and keep the path (e.g., /uploads/image.jpg)
      try {
        const url = new URL(cleanPath);
        cleanPath = url.pathname;
      } catch (e) {
        // Fallback: remove everything up to /uploads
        const uploadsIdx = cleanPath.indexOf('/uploads');
        if (uploadsIdx !== -1) cleanPath = cleanPath.substring(uploadsIdx);
      }
    } else {
      // It's a valid external URL (like Unsplash), ensure no spaces
      return cleanPath.replace(/\s/g, '%20');
    }
  }
  
  // 2. Auto-fix missing /uploads/
  if (!cleanPath.includes('uploads') && (cleanPath.startsWith('bg_') || cleanPath.startsWith('livetv_') || cleanPath.match(/\.(jpg|jpeg|png|gif|webp|mp4)$/i))) {
    cleanPath = `/uploads/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  }

  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  // 3. Force Production URL if not on localhost
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? 'http://localhost:5000' : 'https://smart-agri-platform.onrender.com';
  
  // 4. Clean spaces and add dynamic cache buster to FORCE browser update
  const sanitizedPath = finalPath.replace(/\s/g, '%20');
  const result = `${base}${sanitizedPath}?v=4_stable`;
  
  return result;
};
