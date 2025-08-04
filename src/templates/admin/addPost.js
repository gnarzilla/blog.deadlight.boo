// src/templates/admin/addPost.js
import { renderTemplate } from '../base.js';

export function renderAddPostForm(user, config = null) {
  const content = `
    <div class="admin-form-container">
      <h1>Add New Post</h1>
      <form method="POST" action="/admin/add" class="post-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" name="title" required autofocus>
        </div>
        
        <div class="form-group">
          <label for="slug">Slug (URL path)</label>
          <input type="text" id="slug" name="slug" 
                 pattern="[a-z0-9-]+" title="Only lowercase letters, numbers, and hyphens allowed">
          <small>Leave blank to auto-generate from title</small>
        </div>
        
        <div class="form-group">
          <label for="excerpt">Excerpt (optional)</label>
          <textarea id="excerpt" name="excerpt" rows="3" 
                    placeholder="Brief description for previews..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="content">Content (Markdown supported)</label>
          <textarea id="content" name="content" rows="20" required 
                    placeholder="Write your post content here...

Use **bold** and *italic* text, add [links](https://example.com), and more!

## Headings
### Subheadings

- List items
- Another item

\`\`\`javascript
// Code blocks work too!
console.log('Hello world!');
\`\`\`

Add <!--more--> to create a custom excerpt break point."></textarea>
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
  `;

  return renderTemplate('Add New Post', content, user, config);
}