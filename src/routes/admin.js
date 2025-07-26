// src/routes/admin.js
import { 
  renderAddPostForm, 
  renderEditPostForm, 
  renderAddUserForm,  // Add this to your templates
  renderDeleteConfirmation
} from '../templates/admin/index.js';
import { checkAuth, hashPassword } from '../utils/auth.js';
import { renderTemplate } from '../templates/base.js';
import { renderSettings } from '../templates/admin/settings.js';
import { renderAdminDashboard } from '../templates/admin/dashboard.js';
import { renderUserManagement } from '../templates/admin/userManagement.js';
import { siteConfig } from '../config.js';

export const adminRoutes = {
    '/admin': {
    GET: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return Response.redirect(new URL(request.url).origin + '/login', 303);
        }

        // Gather statistics
        const stats = await env.DB.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM posts) as total_posts,
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM posts WHERE date(created_at) = date('now')) as posts_today,
            (SELECT COUNT(*) FROM request_logs WHERE date(timestamp) >= date('now', '-7 days')) as weekly_requests
        `).first();

        // Get recent posts
        const recentPosts = await env.DB.prepare(`
          SELECT p.*, u.username as author_username 
          FROM posts p
          JOIN users u ON p.user_id = u.id
          ORDER BY p.created_at DESC
          LIMIT 5
        `).all();

        // Get request stats for chart (last 7 days)
        const requestStats = await env.DB.prepare(`
          SELECT 
            date(timestamp) as day,
            COUNT(*) as requests
          FROM request_logs
          WHERE date(timestamp) >= date('now', '-7 days')
          GROUP BY date(timestamp)
          ORDER BY day
        `).all();

        return new Response(renderAdminDashboard(stats, recentPosts.results, requestStats.results, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Admin dashboard error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  // Add to admin routes
  '/admin/users': {
    GET: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return Response.redirect(new URL(request.url).origin + '/login', 303);
        }

        const users = await env.DB.prepare(`
          SELECT 
            u.*,
            COUNT(p.id) as post_count,
            MAX(p.created_at) as last_post
          FROM users u
          LEFT JOIN posts p ON u.id = p.user_id
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `).all();

        return new Response(renderUserManagement(users.results, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('User management error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  // Add to src/routes/admin.js
  '/admin/users/delete/:id': {
    POST: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const userId = parseInt(request.params.id);
        
        // Prevent self-deletion
        if (userId === user.id) {
          return new Response('Cannot delete your own account', { status: 400 });
        }

        // Check if user exists
        const targetUser = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!targetUser) {
          return new Response('User not found', { status: 404 });
        }

        // Delete user and their posts (CASCADE should handle posts)
        await env.DB.prepare(
          'DELETE FROM users WHERE id = ?'
        ).bind(userId).run();

        return Response.redirect(new URL(request.url).origin + '/admin/users', 303);
      } catch (error) {
        console.error('Delete user error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  // Add to src/routes/admin.js
  '/admin/settings': {
    GET: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return Response.redirect(new URL(request.url).origin + '/login', 303);
        }

        // For now use the config file values
        // Later you could store these in D1
        const settings = {
          title: siteConfig.title,
          description: siteConfig.description,
          postsPerPage: siteConfig.postsPerPage,
          dateFormat: siteConfig.dateFormat
        };

        return new Response(renderSettings(settings, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Settings error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  '/admin/delete/:id': {
    POST: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const postId = request.params.id;
        
        // Verify post exists
        const post = await env.DB.prepare(
          'SELECT * FROM posts WHERE id = ?'
        ).bind(postId).first();

        if (!post) {
          return new Response('Post not found', { status: 404 });
        }

        // Delete the post
        await env.DB.prepare(
          'DELETE FROM posts WHERE id = ?'
        ).bind(postId).run();

        // Redirect to homepage after successful deletion
        return Response.redirect(new URL(request.url).origin + '/', 303);
      } catch (error) {
        console.error('Delete post error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  '/admin/add': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return new Response('Unauthorized', { status: 401 });
      }
      
      return new Response(renderAddPostForm(), {
        headers: { 'Content-Type': 'text/html' }
      });
    },
    
    POST: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Create new request to handle FormData
        const formDataRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        const formData = await formDataRequest.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        console.log('Adding post:', { title, contentLength: content?.length });

        if (!title || !content) {
          return new Response('Missing title or content', { status: 400 });
        }

        await env.DB.prepare(
          'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)'
        ).bind(title, content, user.id).run();

        return Response.redirect(new URL(request.url).origin + '/', 303);
      } catch (error) {
        console.error('Add post error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  '/admin/users/add': {
    GET: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        return new Response(renderAddUserForm(user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Get add user form error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    },
    
    POST: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        // Create new request to handle FormData
        const formDataRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        const formData = await formDataRequest.formData();
        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) {
          return new Response('Missing username or password', { status: 400 });
        }

        const { hash, salt } = await hashPassword(password);
        
        await env.DB.prepare(
          'INSERT INTO users (username, password, salt) VALUES (?, ?, ?)'
        ).bind(username, hash, salt).run();
        
        return Response.redirect(new URL(request.url).origin + '/', 303);
      } catch (error) {
        console.error('Add user error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  },

  '/admin/edit/:id': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return new Response('Unauthorized', { status: 401 });
      }

      const postId = request.params.id;
      const post = await env.DB.prepare(
        'SELECT * FROM posts WHERE id = ?'
      ).bind(postId).first();

      if (!post) {
        return new Response('Post not found', { status: 404 });
      }

      return new Response(renderEditPostForm(post), {
        headers: { 'Content-Type': 'text/html' }
      });
    },
    
    POST: async (request, env) => {
      try {
        const user = await checkAuth(request, env);
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }

        const postId = request.params.id;
        
        // Create new request to handle FormData
        const formDataRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        const formData = await formDataRequest.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        if (!title || !content) {
          return new Response('Missing title or content', { status: 400 });
        }

        await env.DB.prepare(
          'UPDATE posts SET title = ?, content = ? WHERE id = ?'
        ).bind(title, content, postId).run();

        return Response.redirect(new URL(request.url).origin + '/', 303);
      } catch (error) {
        console.error('Edit post error:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
  }
};