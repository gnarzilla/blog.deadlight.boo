// src/middleware/error.js
export const errorMiddleware = async (request, env, next) => {
  try {
    const response = await next();
    return response;
  } catch (error) {
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method
    });
    
    const errorMap = {
      'Unauthorized': { status: 401, message: 'Unauthorized access' },
      'Not Found': { status: 404, message: 'Resource not found' },
      'Invalid request data': { status: 400, message: 'Invalid request data' },
      'default': { status: 500, message: 'Internal server error' }
    };

    const errorResponse = errorMap[error.message] || errorMap.default;
    
    // Check for development mode
    const isDevelopment = env.ENVIRONMENT !== 'production';
    const responseBody = isDevelopment 
      ? `Error: ${error.message}\n\nStack: ${error.stack}`
      : errorResponse.message;

    return new Response(responseBody, { 
      status: errorResponse.status,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};