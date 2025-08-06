// src/utils/subdomain.js
export function parseSubdomain(request) {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Handle localhost development - treat as blog feed for testing
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return { isBlogFeed: true, isDevelopment: true };
  }
  
  // Main domain = landing page
  if (hostname === 'deadlight.boo') {
    return { isLandingPage: true };
  }
  
  // Blog subdomain = public community feed  
  if (hostname === 'blog.deadlight.boo') {
    return { isBlogFeed: true };
  }
  
  // Check for user subdomains
  const parts = hostname.split('.');
  
  // Need exactly 3 parts for user subdomain (user.deadlight.boo)
  if (parts.length === 3) {
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    
    // Only process deadlight.boo subdomains
    if (domain === 'deadlight.boo') {
      // Reserved subdomains
      const RESERVED = [
        // Infrastructure
        'www', 'api', 'cdn', 'static', 'assets', 'media', 'files', 'storage',
        
        // Current/Future Services  
        'blog', 'proxy', 'comm', 'email', 'lib', 'chat', 'message', 'mail',
        'conn', 'connection', 'socket', 'ws', 'websocket',
        
        // Admin/System
        'admin', 'root', 'system', 'config', 'manage', 'dashboard', 'control',
        'staff', 'team', 'mod', 'moderator', 'owner',
        
        // Versions
        'v1', 'v2', 'v3', 'v4', 'v5', 'version', 'legacy', 'old', 'archive',
        
        // Development
        'dev', 'test', 'staging', 'beta', 'alpha', 'demo', 'sandbox', 'local',
        
        // Services
        'help', 'support', 'docs', 'wiki', 'status', 'health', 'monitor',
        'search', 'index', 'feed', 'rss', 'atom',
        
        // Social/Discovery
        'popular', 'trending', 'hot', 'new', 'top', 'best', 'featured',
        'discover', 'explore', 'browse', 'all', 'public',
        
        // Auth/Security
        'login', 'auth', 'oauth', 'signin', 'signup', 'register', 'account',
        'profile', 'user', 'users', 'settings',
        
        // Brand Protection
        'deadlight', 'official', 'brand', 'company', 'corp',
        
        // Common Misuse
        'abuse', 'spam', 'phishing', 'malware', 'virus', 'hack',
        'fuck', 'shit', 'damn', 'sex', 'porn', 'adult',
        
        // Technical
        'ftp', 'ssh', 'sftp', 'git', 'svn', 'db', 'database', 'backup',
        'log', 'logs', 'error', 'debug', 'trace'
      ];
      
      if (!RESERVED.includes(subdomain.toLowerCase())) {
        return {
          isUserSubdomain: true,
          username: subdomain.toLowerCase(),
          path: url.pathname,
          search: url.search
        };
      }
    }
  }
  
  // Unknown/unsupported domain
  return { isUnknown: true };
}

export async function handleSubdomainRequest(request, env, subdomainInfo) {
  // Check if user exists
  const user = await env.DB.prepare(
    'SELECT id, username, subdomain, profile_title FROM users WHERE subdomain = ?'
  ).bind(subdomainInfo.subdomain).first();
  
  if (!user) {
    return new Response('User not found', { status: 404 });
  }
  
  // Route subdomain requests to user profile logic
  const path = subdomainInfo.path;
  
  if (path === '/' || path === '') {
    // alice.deadlight.boo/ → show Alice's profile
    return redirectToUserProfile(request, env, user.username, subdomainInfo.search);
  } else if (path.startsWith('/post/')) {
    // alice.deadlight.boo/post/something → show post (if it belongs to Alice)
    return handleSubdomainPost(request, env, user, path);
  } else {
    // Other paths on subdomain don't exist
    return new Response('Page not found', { status: 404 });
  }
}

async function redirectToUserProfile(request, env, username, search = '') {
  // Reuse existing user profile logic by creating a fake request
  const { userRoutes } = await import('../routes/user.js');
  const profileHandler = userRoutes['/user/:username'].GET;
  
  // Create fake request params
  const fakeRequest = {
    ...request,
    params: { username }
  };
  
  return await profileHandler(fakeRequest, env);
}

async function handleSubdomainPost(request, env, user, path) {
  // Extract post ID/slug from path (/post/something)
  const postId = path.split('/post/')[1];
  if (!postId) {
    return new Response('Post not found', { status: 404 });
  }
  
  // Check if post belongs to this user and is published
  const post = await env.DB.prepare(`
    SELECT posts.*, users.username as author_username
    FROM posts 
    JOIN users ON posts.author_id = users.id
    WHERE (posts.slug = ? OR posts.id = ?) 
      AND posts.author_id = ? 
      AND posts.published = 1
      AND (posts.is_email = 0 OR posts.is_email IS NULL)
  `).bind(postId, postId, user.id).first();
  
  if (!post) {
    return new Response('Post not found', { status: 404 });
  }
  
  // Reuse existing single post logic
  const { blogRoutes } = await import('../routes/blog.js');
  const postHandler = blogRoutes['/post/:id'].GET;
  
  const fakeRequest = {
    ...request,
    params: { id: postId }
  };
  
  return await postHandler(fakeRequest, env);
}
