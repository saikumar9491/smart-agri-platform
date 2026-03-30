const hostname = window.location.hostname;
const isLocal = 
  hostname === 'localhost' || 
  hostname === '127.0.0.1' || 
  hostname === '[::1]' || 
  hostname === '::1' ||
  hostname.startsWith('192.168.') || 
  hostname.startsWith('10.') || 
  hostname.startsWith('172.');

export const API_URL = isLocal 
  ? `http://${hostname}:5001` 
  : 'https://smart-agri-platform.onrender.com';

export const GOOGLE_CLIENT_ID = '1047387934744-eqvk3hfnopppco50ljkfpocjd9ss9dhf.apps.googleusercontent.com';
