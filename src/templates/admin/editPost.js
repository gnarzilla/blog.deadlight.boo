// src/templates/admin/editPost.js
import { renderTemplate } from '../base.js';

export function renderEditPostForm(post, user) {
  return renderTemplate(
    'Edit Post',
    `
    <h1>Edit Post</h1>
    <form action="/admin/edit/${post.id}" method="POST">
      <input type="text" name="title" value="${post.title}" required>
      <textarea name="content" required>${post.content}</textarea>
      <button type="submit">Update Post</button>
      <a href="/">Cancel</a>
    </form>
    `,
    user
  );
}
