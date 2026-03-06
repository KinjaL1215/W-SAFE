const securityHeaders = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // FIXED: Changed geolocation from () to (self) to allow your site to use GPS
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

  next();
};

module.exports = securityHeaders;