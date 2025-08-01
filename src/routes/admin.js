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
      const userModel = new UserModel(env.DB);
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        // Gather statistics
        const totalPosts = await postModel.count();
        const totalUsers = await userModel.count();
        
        // Get posts created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const postsToday = await env.DB
          .prepare('SELECT COUNT(*) as count FROM posts WHERE created_at >= ?')
          .bind(today.toISOString())
          .first();
        
        // For now, just use total posts since we don't have published column
        const publishedPosts = totalPosts;

        // Get recent posts with author info
        const { posts } = await postModel.getPaginated({
          page: 1,
          limit: 10,
          includeAuthor: true,
          orderBy: 'created_at',
          orderDirection: 'DESC',
          publishedOnly: false  // Show all posts in admin
        });

        const stats = {
          totalPosts,
          totalUsers,
          postsToday: postsToday?.count || 0,
          publishedPosts
        };

        // For now, pass empty array for requestStats until we implement request logging
        const requestStats = [];

        // Import and use the dashboard template
        const { renderAdminDashboard } = await import('../templates/admin/dashboard.js');
        
        return new Response(renderAdminDashboard(stats, posts, requestStats, user), {
          headers: { 'Content-Type': 'text/html' }
        });
        
      } catch (error) {
        console.error('Admin dashboard error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    }
  },

  // Add to src/routes/admin.js adminRoutes object
  '/admin/settings': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const { SettingsModel } = await import('../../../../lib.deadlight/core/src/db/models/index.js');
        const settingsModel = new SettingsModel(env.DB);
        const settings = await settingsModel.getAll();
        
        const { renderSettings } = await import('../templates/admin/settings.js');
        return new Response(renderSettings(settings, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Settings error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    },

    POST: async (request, env) => {
      const user = await checkAuth(request, env);
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const formData = await request.formData();
        const { SettingsModel } = await import('../../../../lib.deadlight/core/src/db/models/index.js');
        const settingsModel = new SettingsModel(env.DB);
        
        // Update text/number settings
        await settingsModel.set('site_title', formData.get('site_title') || '', 'string');
        await settingsModel.set('site_description', formData.get('site_description') || '', 'string');
        await settingsModel.set('posts_per_page', formData.get('posts_per_page') || '10', 'number');
        await settingsModel.set('date_format', formData.get('date_format') || 'M/D/YYYY', 'string');
        await settingsModel.set('timezone', formData.get('timezone') || 'UTC', 'string');
        
        // Update boolean settings (checkboxes)
        await settingsModel.set('enable_registration', formData.has('enable_registration'), 'boolean');
        await settingsModel.set('require_login_to_read', formData.has('require_login_to_read'), 'boolean');
        await settingsModel.set('maintenance_mode', formData.has('maintenance_mode'), 'boolean');
        
        return Response.redirect(`${new URL(request.url).origin}/admin`);
      } catch (error) {
        console.error('Settings update error:', error);
        return new Response('Failed to update settings', { status: 500 });
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

    // src/routes/admin.js - Update the POST handler for /admin/add
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
        const slug = formData.get('slug') || '';
        const excerpt = formData.get('excerpt') || '';
        // Check if checkbox is present (checkboxes only send value when checked)
        const published = formData.has('published');

        logger.info('Adding post', { 
          title, 
          contentLength: content?.length,
          published // Log the published status
        });

        if (!title || !content) {
          return new Response('Title and content are required', { status: 400 });
        }

        // Create post using model with all required fields
        const newPost = await postModel.create({
          title,
          content,
          slug: slug || postModel.generateSlug(title),
          excerpt,
          author_id: user.id,
          published // This will be true/false
        });

        logger.info('Post created successfully', { 
          postId: newPost.id, 
          title,
          published: newPost.published 
        });

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

    // src/routes/admin.js - Update the POST handler for /admin/edit/:id
    POST: async (request, env) => {
      const postModel = new PostModel(env.DB);
      const logger = new Logger({ context: 'admin' });
      const user = await checkAuth(request, env);
      
      if (!user) {
        return Response.redirect(`${new URL(request.url).origin}/login`);
      }

      try {
        const postId = request.params.id;
        
        // Get the existing post first
        const existingPost = await postModel.getById(postId);
        if (!existingPost) {
          return new Response('Post not found', { status: 404 });
        }
        
        const formData = await request.formData();
        const title = formData.get('title');
        const content = formData.get('content');
        const slug = formData.get('slug') || '';
        const excerpt = formData.get('excerpt') || '';
        const published = formData.has('published');
        
        if (!title || !content) {
          return new Response('Title and content are required', { status: 400 });
        }
        
        // Only update slug if it changed and is not empty
        const updatedSlug = slug && slug !== existingPost.slug 
          ? slug 
          : existingPost.slug;
        
        // Update post using model
        const updatedPost = await postModel.update(postId, { 
          title, 
          content,
          slug: updatedSlug,
          excerpt,
          published
        });

        logger.info('Post updated successfully', { 
          postId, 
          title,
          slug: updatedPost.slug,
          published: updatedPost.published 
        });

        return Response.redirect(`${new URL(request.url).origin}/`);
      } catch (error) {
        logger.error('Error updating post', { postId: request.params.id, error: error.message });
        
        if (error instanceof DatabaseError && error.code === 'NOT_FOUND') {
          return new Response('Post not found', { status: 404 });
        }
        
        return new Response(`Failed to update post: ${error.message}`, { status: 500 });
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