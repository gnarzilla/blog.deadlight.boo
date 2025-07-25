// middleware/analytics.js
export async function analyticsMiddleware(request, env) {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  // Let the request continue
  // Store the timing info for after the response
  request.analytics = {
    path: url.pathname,
    startTime,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('cf-connecting-ip')
  };
}
