// src/routes/static.js
export const staticRoutes = {
  '/favicon.ico': {
    GET: async (request, env) => {
      try {
        // Use the ASSETS binding to fetch the favicon
        const asset = await env.ASSETS.fetch(new URL('/favicon.ico', request.url));
        
        if (asset.status === 200) {
          return new Response(await asset.arrayBuffer(), {
            headers: {
              'Content-Type': 'image/x-icon',
              'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
            }
          });
        }
        
        // If favicon not found in assets, return SVG fallback
        const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <rect width="32" height="32" fill="#1a1a1a"/>
          <path d="M16 4l-2 2v4l-4 4v10l4 4h4l4-4V14l-4-4V6l-2-2z" fill="white"/>
        </svg>`;
        
        return new Response(svgFavicon, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
          }
        });
        
      } catch (error) {
        console.error('Favicon error:', error);
        
        // Fallback SVG favicon
        const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <rect width="32" height="32" fill="#1a1a1a"/>
          <path d="M16 4l-2 2v4l-4 4v10l4 4h4l4-4V14l-4-4V6l-2-2z" fill="white"/>
        </svg>`;
        
        return new Response(svgFavicon, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    }
  },

  // Also add support for apple-touch-icon if you created one
  '/apple-touch-icon.png': {
    GET: async (request, env) => {
      try {
        const asset = await env.ASSETS.fetch(new URL('/apple-touch-icon.png', request.url));
        
        if (asset.status === 200) {
          return new Response(await asset.arrayBuffer(), {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=31536000'
            }
          });
        }
        
        return new Response(null, { status: 404 });
      } catch (error) {
        console.error('Apple touch icon error:', error);
        return new Response(null, { status: 404 });
      }
    }
  }
};