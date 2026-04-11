const hostname = window.location.hostname;
export const API_URL = (hostname.includes('vercel.app') || hostname.includes('onrender.com'))
  ? 'https://smart-agri-platform.onrender.com'
  : `http://${hostname}:5001`;

export const GOOGLE_CLIENT_ID = '1047387934744-eqvk3hfnopppco50ljkfpocjd9ss9dhf.apps.googleusercontent.com';
