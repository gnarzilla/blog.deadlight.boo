// src/routes/blog.js
import { renderPostList } from '../templates/blog/list.js';
import { renderSinglePost } from '../templates/blog/single.js';
import { checkAuth } from '../utils/auth.js';
import { siteConfig } from '../config.js';

export const blogRoutes = {
  '/': {
    GET: async (request, env) => {
      // Check authentication
      const user = await checkAuth(request, env);
      console.log('Auth check result:', { isAuthenticated: !!user, user });
      
      // Get page number from query params
      const page = parseInt(request.query?.page || '1');
      const offset = (page - 1) * siteConfig.postsPerPage;  // Changed from config.blog.postsPerPage
      
      // Get total count for pagination
      const countResult = await env.DB.prepare(
        'SELECT COUNT(*) as total FROM posts'
      ).first();
      const totalPosts = countResult.total;
      const totalPages = Math.ceil(totalPosts / siteConfig.postsPerPage);  // Changed here too
      
      // Get posts for current page
      const result = await env.DB.prepare(`
        SELECT 
          posts.*, 
          users.username as author_username 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(siteConfig.postsPerPage, offset).all();  // And here

      const paginationData = {
        currentPage: page,
        totalPages: totalPages,
        totalPosts: totalPosts,
        postsPerPage: siteConfig.postsPerPage,  // And here
        hasPrevious: page > 1,
        hasNext: page < totalPages,
        previousPage: page - 1,
        nextPage: page + 1
      };

      return new Response(
        renderPostList(result.results, user, paginationData), 
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
  },
  
  '/post/:id': {
    GET: async (request, env) => {
      const user = await checkAuth(request, env);
      const postId = request.params.id;
      
      // Get the post
      const post = await env.DB.prepare(`
        SELECT 
          posts.*, 
          users.username as author_username 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = ?
      `).bind(postId).first();
      
      if (!post) {
        throw new Error('Not Found');
      }
      
      // Get next/previous posts for navigation
      const navigation = await env.DB.prepare(`
        SELECT 
          (SELECT id FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1) as prev_id,
          (SELECT title FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1) as prev_title,
          (SELECT id FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1) as next_id,
          (SELECT title FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1) as next_title
      `).bind(postId, postId, postId, postId).first();
      
      return new Response(
        renderSinglePost(post, user, navigation),
        {
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
  }
};