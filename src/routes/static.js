// src/routes/static.js
export const staticRoutes = {
  '/favicon.ico': {
    GET: async (request, env) => {
      try {
        // For now, return a simple 204 No Content
        return new Response(null, { 
          status: 204,
          headers: {
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch (error) {
        console.error('Favicon error:', error);
        return new Response(null, { status: 404 });
      }
    }
  }
};