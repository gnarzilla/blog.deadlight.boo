// src/templates/admin/deletePost.js
import { renderTemplate } from '../base.js';

export function renderDeleteConfirmation(post) {
  return renderTemplate(
    'Delete Post',
    `
    <div class="delete-confirmation">
      <h1>Delete Post</h1>
      <p>Are you sure you want to delete "${post.title}"?</p>
      <form action="/admin/delete/${post.id}" method="POST">
        <button type="submit" class="delete-button">Delete</button>
        <a href="/" class="cancel-button">Cancel</a>
      </form>
    </div>
    `
  );
}
