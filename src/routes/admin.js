// src/routes/admin.js
import { 
  renderAddPostForm, 
  renderEditPostForm, 
  renderAddUserForm,  // Add this to your templates
  renderDeleteConfirmation
} from '../templates/admin/index.js';
import { checkAuth, hashPassword } from '../utils/auth.js';
import { renderTemplate } from '../templates/base.js';

export const adminRoutes = {
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