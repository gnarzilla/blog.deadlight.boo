// src/routes/admin.js - Refactored to use deadlight-lib
import { 
  renderAddPostForm, 
  renderEditPostForm, 
  renderAddUserForm, 
  renderDeleteConfirmation
} from '../templates/admin/index.js';
import { checkAuth } from '../utils/auth.js';
import { renderTemplate } from '../templates/base.js';
import { UserModel, PostModel } from '../../../../lib.deadlight/core/src/db/models/index.js';
import { Logger } from '../../../../lib.deadlight/core/src/logging/logger.js';
import { DatabaseError } from '../../../../lib.deadlight/core/src/db/base.js';

export const adminRoutes = {
  '/admin': {
    GET: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        // Get paginated posts with author info
        const { posts, pagination } = await postModel.getPaginated({
          page: 1,
          limit: 20,
          includeAuthor: true,
          orderBy: 'created_at',
          orderDirection: 'DESC'
        });

        const totalPosts = await postModel.count();

        const content = `
          <h1>Admin Dashboard</h1>
          <div class="stats">
            <p>Total Posts: ${totalPosts}</p>
          </div>
          <div class="admin-actions">
            <a href="/admin/add" class="button">Add New Post</a>
            <a href="/admin/users" class="button">Manage Users</a>
          </div>
          <div class="posts-list">
            <h2>Recent Posts</h2>
            ${posts.map(post => `
              <div class="post-item">
                <h3>${post.title}</h3>
                <p>By: ${post.author_username} | Created: ${new Date(post.created_at).toLocaleDateString()}</p>
                <div class="post-actions">
                  <a href="/admin/edit/${post.id}" class="button small">Edit</a>
                  <form method="POST" action="/admin/delete/${post.id}" style="display: inline;">
                    <button type="submit" class="button small danger" onclick="return confirm('Delete this post?')">Delete</button>
                  </form>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        return new Response(renderTemplate('Admin Dashboard', content, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Admin dashboard error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    }
  },

  '/admin/add': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      return new Response(renderAddPostForm(user), {
        headers: { 'Content-Type': 'text/html' }
      });
    },

    POST: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        logger.info('Adding post', { title, contentLength: content?.length });

        if (!title || !content) {
          return new Response('Title and content are required', { status: 400 });
        }

        // Create post using model
        const newPost = await postModel.create({
          title,
          content,
          userId: user.id
        });

        logger.info('Post created successfully', { postId: newPost.id, title });

        return Response.redirect(`${new URL(request.url).origin}/`);
      } catch (error) {
        logger.error('Error adding post', { error: error.message });
        
        if (error instanceof DatabaseError) {
          return new Response(`Database error: ${error.message}`, { status: 500 });
        }
        
        return new Response('Failed to add post', { status: 500 });
      }
    }
  },

  '/admin/edit/:id': {
    GET: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const postId = request.params.id;
        const post = await postModel.getById(postId);

        if (!post) {
          return new Response('Post not found', { status: 404 });
        }

        return new Response(renderEditPostForm(post, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Error loading post for edit:', error);
        return new Response('Internal server error', { status: 500 });
      }
    },

    POST: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const postId = request.params.id;
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');

        if (!title || !content) {
          return new Response('Title and content are required', { status: 400 });
        }

        // Update post using model
        const updatedPost = await postModel.update(postId, { title, content });

        logger.info('Post updated successfully', { postId, title });

        return Response.redirect(`${new URL(request.url).origin}/`);
      } catch (error) {
        logger.error('Error updating post', { postId: request.params.id, error: error.message });
        
        if (error instanceof DatabaseError && error.code === 'NOT_FOUND') {
          return new Response('Post not found', { status: 404 });
        }
        
        return new Response('Failed to update post', { status: 500 });
      }
    }
  },

  '/admin/delete/:id': {
    POST: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const postId = request.params.id;
        
        // Delete post using model
        await postModel.delete(postId);

        logger.info('Post deleted successfully', { postId });

        return Response.redirect(`${new URL(request.url).origin}/`);
      } catch (error) {
        logger.error('Error deleting post', { postId: request.params.id, error: error.message });
        
        if (error instanceof DatabaseError && error.code === 'NOT_FOUND') {
          return new Response('Post not found', { status: 404 });
        }
        
        return new Response('Failed to delete post', { status: 500 });
      }
    }
  },

  '/admin/users': {
    GET: async (request, env) => {
      const userModel = new UserModel(env.DB);
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        // Get all users (paginated in the future if needed)
        const users = await userModel.list({ limit: 50 });
        const totalUsers = await userModel.count();

        const content = `
          <h1>User Management</h1>
          <div class="stats">
            <p>Total Users: ${totalUsers}</p>
          </div>
          <div class="admin-actions">
            <a href="/admin/users/add" class="button">Add New User</a>
            <a href="/admin" class="button secondary">Back to Dashboard</a>
          </div>
          <div class="users-list">
            <h2>All Users</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td>${u.id}</td>
                    <td>${u.username}</td>
                    <td>${u.role || 'user'}</td>
                    <td>${new Date(u.created_at).toLocaleDateString()}</td>
                    <td>${u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <form method="POST" action="/admin/users/delete/${u.id}" style="display: inline;">
                        <button type="submit" class="button small danger" 
                                onclick="return confirm('Delete user ${u.username}?')"
                                ${u.id === user.id ? 'disabled title="Cannot delete yourself"' : ''}>
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        return new Response(renderTemplate('User Management', content, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('User management error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    }
  },

  '/admin/users/add': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      return new Response(renderAddUserForm(user), {
        headers: { 'Content-Type': 'text/html' }
      });
    },

    POST: async (request, env) => {
      const userModel = new UserModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const formData = await request.formData();
        const username = formData.get('username');
        const password = formData.get('password');
        const role = formData.get('role') || 'user';

        if (!username || !password) {
          return new Response('Username and password are required', { status: 400 });
        }

        // Create user using model
        const newUser = await userModel.create({ username, password, role });

        logger.info('User created successfully', { userId: newUser.id, username, role });

        return Response.redirect(`${new URL(request.url).origin}/admin/users`);
      } catch (error) {
        logger.error('Error creating user', { error: error.message });
        
        if (error instanceof DatabaseError && error.code === 'DUPLICATE_USER') {
          return new Response('Username already exists', { status: 400 });
        }
        
        return new Response('Failed to create user', { status: 500 });
      }
    }
  },

  '/admin/users/delete/:id': {
    POST: async (request, env) => {
      const userModel = new UserModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const userId = parseInt(request.params.id);
        
        // Prevent self-deletion
        if (userId === user.id) {
          return new Response('Cannot delete yourself', { status: 400 });
        }

        // Delete user using model
        await userModel.delete(userId);

        logger.info('User deleted successfully', { userId });

        return Response.redirect(`${new URL(request.url).origin}/admin/users`);
      } catch (error) {
        logger.error('Error deleting user', { userId: request.params.id, error: error.message });
        return new Response('Failed to delete user', { status: 500 });
      }
    }
  }
};