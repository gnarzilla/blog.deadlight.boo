// src/services/postService.js
export class PostService {
  constructor(db) {
    this.db = db;
  }

  async createPost(postData, authorId) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await this.db.prepare(`
      INSERT INTO posts (id, title, slug, content, author_id, published, created_at, updated_at, visibility, moderation_status, moderation_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, 
      postData.title, 
      postData.slug, 
      postData.content, 
      authorId, 
      postData.published || false, 
      now, 
      now,
      postData.visibility || 'public',
      postData.moderation_status || 'approved',
      postData.moderation_notes || null
    ).run();
    
    return id;
  }

  async getPostById(id) {
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = ?
    `).bind(id).first();
    
    return result;
  }

  async getPostBySlug(slug, authorId = null) {
    let query = `
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.slug = ?
    `;
    
    if (authorId) {
      query += ' AND p.author_id = ?';
      return await this.db.prepare(query).bind(slug, authorId).first();
    }
    
    return await this.db.prepare(query).bind(slug).first();
  }

  async getPublishedPosts(limit = 10, offset = 0) {
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.published = 1 
        AND p.visibility = 'public' 
        AND p.moderation_status = 'approved'
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return result.results || [];
  }

  async getPublishedPostsByUser(userId, limit = 10, offset = 0) {
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.author_id = ? 
        AND p.published = 1 
        AND p.moderation_status = 'approved'
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    return result.results || [];
  }

  async getPublicPostsByUser(userId, limit = 10, offset = 0) {
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.author_id = ? 
        AND p.published = 1 
        AND p.visibility = 'public' 
        AND p.moderation_status = 'approved'
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();
    
    return result.results || [];
  }

  async getAllPostsByUser(userId, includeUnpublished = false, limit = 10, offset = 0) {
    let query = `
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.author_id = ?
    `;
    
    if (!includeUnpublished) {
      query += ' AND p.published = 1';
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    
    const result = await this.db.prepare(query).bind(userId, limit, offset).all();
    return result.results || [];
  }

  async updatePost(id, postData, authorId = null) {
    const now = new Date().toISOString();
    let query = `
      UPDATE posts 
      SET title = ?, slug = ?, content = ?, published = ?, updated_at = ?, 
          visibility = ?, moderation_status = ?, moderation_notes = ?
      WHERE id = ?
    `;
    
    const bindings = [
      postData.title,
      postData.slug,
      postData.content,
      postData.published || false,
      now,
      postData.visibility || 'public',
      postData.moderation_status || 'approved',
      postData.moderation_notes || null,
      id
    ];
    
    if (authorId) {
      query += ' AND author_id = ?';
      bindings.push(authorId);
    }
    
    const result = await this.db.prepare(query).bind(...bindings).run();
    return result.changes > 0;
  }

  async deletePost(id, authorId = null) {
    let query = 'DELETE FROM posts WHERE id = ?';
    const bindings = [id];
    
    if (authorId) {
      query += ' AND author_id = ?';
      bindings.push(authorId);
    }
    
    const result = await this.db.prepare(query).bind(...bindings).run();
    return result.changes > 0;
  }

  async getPostCount(userId = null, published = null, visibility = null) {
    let query = 'SELECT COUNT(*) as count FROM posts WHERE 1=1';
    const bindings = [];
    
    if (userId) {
      query += ' AND author_id = ?';
      bindings.push(userId);
    }
    
    if (published !== null) {
      query += ' AND published = ?';
      bindings.push(published ? 1 : 0);
    }
    
    if (visibility) {
      query += ' AND visibility = ?';
      bindings.push(visibility);
    }
    
    const result = await this.db.prepare(query).bind(...bindings).first();
    return result?.count || 0;
  }

  async getPostsAwaitingModeration(limit = 50, offset = 0) {
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.moderation_status = 'pending'
      ORDER BY p.created_at ASC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return result.results || [];
  }

  async approvePost(id) {
    const result = await this.db.prepare(`
      UPDATE posts 
      SET moderation_status = 'approved', moderation_notes = NULL 
      WHERE id = ?
    `).bind(id).run();
    
    return result.changes > 0;
  }

  async rejectPost(id, reason = null) {
    const result = await this.db.prepare(`
      UPDATE posts 
      SET moderation_status = 'rejected', moderation_notes = ? 
      WHERE id = ?
    `).bind(reason, id).run();
    
    return result.changes > 0;
  }

  // Utility method to generate unique slug
  async generateUniqueSlug(baseSlug, authorId = null, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      let query = 'SELECT id FROM posts WHERE slug = ?';
      const bindings = [slug];
      
      if (authorId) {
        query += ' AND author_id = ?';
        bindings.push(authorId);
      }
      
      if (excludeId) {
        query += ' AND id != ?';
        bindings.push(excludeId);
      }
      
      const existing = await this.db.prepare(query).bind(...bindings).first();
      
      if (!existing) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Search functionality
  async searchPosts(query, limit = 10, offset = 0) {
    const searchTerm = `%${query}%`;
    const result = await this.db.prepare(`
      SELECT p.*, u.username, u.display_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE (p.title LIKE ? OR p.content LIKE ?)
        AND p.published = 1 
        AND p.visibility = 'public' 
        AND p.moderation_status = 'approved'
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(searchTerm, searchTerm, limit, offset).all();
    
    return result.results || [];
  }
}