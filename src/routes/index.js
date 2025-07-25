// src/routes/index.js
export class Router {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
  }
  
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middlewares.push(middleware);
    return this;
  }

  register(path, handlers) {
    console.log('Registering route:', path);
    const routePattern = path.replace(/\/:(\w+)/g, '/(?<$1>[^/]+)');
    this.routes.set(routePattern, {
      pattern: new RegExp(`^${routePattern}$`),
      handlers
    });
  }

  async handle(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    console.log('Handling request for path:', pathname);
    console.log('Available routes:', Array.from(this.routes.keys()));

    // Find matching route
    let matchedRoute = null;
    let params = {};
    
    for (const [_, route] of this.routes) {
      const match = pathname.match(route.pattern);
      if (match) {
        const handler = route.handlers[request.method];
        if (handler) {
          matchedRoute = handler;
          params = match.groups || {};
          break;
        }
      }
    }

    if (!matchedRoute) {
      throw new Error('Not Found');
    }

    // Enhance request with route info
    request.params = params;
    request.query = Object.fromEntries(url.searchParams);

    // Create middleware chain
    const chain = [...this.middlewares];
    
    // Build the chain from the inside out
    let handler = matchedRoute;
    
    for (let i = chain.length - 1; i >= 0; i--) {
      const middleware = chain[i];
      const nextHandler = handler;
      handler = async (req, env) => {
        return await middleware(req, env, async () => {
          return await nextHandler(req, env);
        });
      };
    }

    // Execute the chain
    return await handler(request, env);
  }
}