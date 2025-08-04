// src/routes/blog.js
import { renderPostList } from '../templates/blog/list.js';
import { renderSinglePost } from '../templates/blog/single.js';
import { checkAuth } from '../utils/auth.js';
import { configService } from '../services/config.js'

export const blogRoutes = {
  '/': {
    GET: async (request, env) => {
      try {
        // Check authentication
        const user = await checkAuth(request, env);
        console.log('Auth check result:', { isAuthenticated: !!user, user });
        
        // Get dynamic config with error handling
        const config = await configService.getConfig(env.DB);
        console.log('Config loaded:', config); // Debug log
        
        // Ensure postsPerPage is a valid number
        const postsPerPage = parseInt(config.postsPerPage) || 10;
        
        // Get page number from query params
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const offset = (page - 1) * postsPerPage;
        
        // Get total count for pagination (only published posts)
        const countResult = await env.DB.prepare(
          'SELECT COUNT(*) as total FROM posts WHERE published = 1'
        ).first();
        const totalPosts = countResult.total;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        
        // Get posts for current page
        const result = await env.DB.prepare(`
          SELECT 
            posts.*, 
            users.username as author_username 
          FROM posts 
          JOIN users ON posts.author_id = users.id 
          WHERE posts.published = 1
          ORDER BY posts.created_at DESC
          LIMIT ? OFFSET ?
        `).bind(postsPerPage, offset).all();

        const paginationData = {
          currentPage: page,
          totalPages: totalPages,
          totalPosts: totalPosts,
          postsPerPage: postsPerPage,
          hasPrevious: page > 1,
          hasNext: page < totalPages,
          previousPage: page - 1,
          nextPage: page + 1
        };

        return new Response(
          renderPostList(result.results, user, paginationData, config), 
          {
            headers: { 'Content-Type': 'text/html' }
          }
        );
      } catch (error) {
        console.error('Blog route error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    }
  },
  
  // ... your existing '/post/:id' route
  
  '/post/:id': {
    GET: async (request, env) => {
      try {
        const postId = request.params.id;
        // Fixed: Use checkAuth instead of auth.getUser
        const user = await checkAuth(request, env);
        
        // First try to find by slug
        let post = await env.DB.prepare(`
          SELECT 
            posts.*,
            users.username as author_username
          FROM posts 
          LEFT JOIN users ON posts.author_id = users.id
          WHERE posts.slug = ? AND posts.published = 1
        `).bind(postId).first();
        
        // If not found by slug, try by ID
        if (!post) {
          post = await env.DB.prepare(`
            SELECT 
              posts.*,
              users.username as author_username
            FROM posts 
            LEFT JOIN users ON posts.author_id = users.id
            WHERE posts.id = ? AND posts.published = 1
          `).bind(postId).first();
        }

        if (!post) {
          return new Response('Post not found', { status: 404 });
        }

        // Fixed: Use renderSinglePost instead of renderPostPage
        return new Response(renderSinglePost(post, user), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Post page error:', error);
        return new Response('Internal server error', { status: 500 });
      }
    }
  }
};