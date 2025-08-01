// src/templates/admin/addPost.js
import { renderTemplate } from '../base.js';

export function renderAddPostForm(user) {
  return renderTemplate('Add New Post', `
    <div class="admin-form-container">
      <h1>Add New Post</h1>
      <form method="POST" action="/admin/add" class="post-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" name="title" required autofocus>
        </div>
        
        <div class="form-group">
          <label for="content">Content (Markdown supported)</label>
          <textarea id="content" name="content" rows="20" required placeholder="Write your post content here..."></textarea>
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" name="published" value="true" checked>
            <span>Publish immediately</span>
          </label>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="button primary">Create Post</button>
          <a href="/admin" class="button">Cancel</a>
        </div>
      </form>
    </div>
  `, user);
}