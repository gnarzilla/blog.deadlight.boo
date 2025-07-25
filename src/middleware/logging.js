// src/middleware/logging.js

// Utility to extract client IP from request
function getClientIP(request) {
  return request.headers.get('cf-connecting-ip') || 
         request.headers.get('x-real-ip') || 
         request.headers.get('x-forwarded-for') || 
         'unknown';
}

// Create the logs table if it doesn't exist
const initLogsTable = async (db) => {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS request_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      duration INTEGER NOT NULL,
      status_code INTEGER,
      user_agent TEXT,
      ip TEXT,
      referer TEXT,
      country TEXT,
      error TEXT
    )
  `).run();
};

// Separate function to log the completed request
export const logRequest = async (request, response, env) => {
  try {
    const duration = Date.now() - request.timing.startTime;
    const analytics = request.analytics || {};
    
    await env.DB.prepare(`
      INSERT INTO request_logs (
        path,
        method,
        duration,
        status_code,
        user_agent,
        ip,
        referer,
        country,
        error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      analytics.path,
      analytics.method,
      duration,
      response.status,
      analytics.userAgent,
      analytics.ip,
      analytics.referer,
      analytics.country,
      response.ok ? null : response.statusText
    ).run();

  } catch (error) {
    console.error('Error logging request:', error);
  }
};

export const loggingMiddleware = async (request, env, next) => {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  try {
    // Initialize logs table if needed
    await initLogsTable(env.DB);
    
    // Collect request data
    const requestData = {
      path: url.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: getClientIP(request),
      referer: request.headers.get('referer') || '',
      country: request.headers.get('cf-ipcountry') || 'unknown'
    };
    
    // Add analytics data to request
    request.analytics = requestData;
    request.timing = { startTime };
    
    // Call the next middleware/handler
    const response = await next();
    
    // Log the completed request
    const duration = Date.now() - startTime;
    
    // Don't await this - log asynchronously to not slow down response
    env.DB.prepare(`
      INSERT INTO request_logs (
        path, method, duration, status_code, 
        user_agent, ip, referer, country, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      requestData.path,
      requestData.method,
      duration,
      response.status,
      requestData.userAgent,
      requestData.ip,
      requestData.referer,
      requestData.country,
      response.ok ? null : response.statusText
    ).run().catch(err => console.error('Failed to log request:', err));
    
    return response;
    
  } catch (error) {
    console.error('Logging middleware error:', error);
    // If logging fails, still continue with the request
    return await next();
  }
};