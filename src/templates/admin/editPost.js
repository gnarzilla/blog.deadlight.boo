// src/templates/admin/editPost.js
import { renderTemplate } from '../base.js';

export function renderEditPostForm(post, user) {
  return renderTemplate('Edit Post', `
    <div class="admin-form-container">
      <h1>Edit Post</h1>
      <div class="post-meta">
        <p>Created: ${new Date(post.created_at).toLocaleString()}</p>
        <p>URL: <a href="/post/${post.slug}" target="_blank">/post/${post.slug}</a></p>
      </div>
      
      <form method="POST" action="/admin/edit/${post.id}" class="post-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" name="title" value="${post.title}" required>
        </div>
        
        <div class="form-group">
          <label for="content">Content (Markdown supported)</label>
          <textarea id="content" name="content" rows="20" required>${post.content}</textarea>
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" name="published" value="true" ${post.published ? 'checked' : ''}>
            <span>${post.published ? 'Published' : 'Draft'} - uncheck to unpublish</span>
          </label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="button primary">Update Post</button>
          <a href="/admin" class="button">Cancel</a>
          <a href="/post/${post.slug}" class="button" target="_blank">View Post</a>
        </div>
      </form>
    </div>
  `, user);
}