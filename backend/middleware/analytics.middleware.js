import Visit from '../models/Visit.js';

export const trackVisit = async (req, res, next) => {
  // We only track GET requests that are not static files or busy API endpoints
  // Specifically we want to track navigation/hits.
  const excludedPaths = ['/api/admin/stats', '/api/notifications/count', '/uploads', '/api/auth/me', '/api/health']; // Noisy or critical endpoints
  const isExcluded = excludedPaths.some(p => req.originalUrl.startsWith(p));

  if (req.method === 'GET' && !isExcluded) {
    // Non-blocking visit tracking to prevent DB latency from stalling the app
    Visit.create({
      path: req.originalUrl,
      userId: req.user ? req.user.id : null,
      ip: req.ip
    }).catch(err => {
      console.error('Visit tracking error (non-blocking):', err);
    });
  }
  next();
};
