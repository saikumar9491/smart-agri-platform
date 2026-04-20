const hostname = window.location.hostname;
const isVercel = hostname.includes('vercel.app');
const isLocal = !isVercel && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local'));

// Log connection info for debugging production issues
console.log('🌐 Environment Check:', { hostname, isVercel, isLocal });

export const API_URL = isLocal
  ? `http://${hostname}:5001`
  : 'https://smart-agri-platform-l6vk.vercel.app';

console.log('📡 Using API_URL:', API_URL);

export const GOOGLE_CLIENT_ID = '1047387934744-eqvk3hfnopppco50ljkfpocjd9ss9dhf.apps.googleusercontent.com';
