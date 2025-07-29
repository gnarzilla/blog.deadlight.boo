// src/templates/admin/addPost.js
import { renderTemplate } from '../base.js';

export function renderAddPostForm(user) {  // <-- Add user parameter
  return renderTemplate(
    'Add Post',
    `
    <h1>Add New Post</h1>
    <form action="/admin/add" method="POST">
      <input type="text" name="title" required placeholder="Title">
      <textarea name="content" required placeholder="Content"></textarea>
      <button type="submit">Add Post</button>
      <a href="/">Cancel</a>
    </form>
    `,
    user  // <-- Pass user to renderTemplate
  );
}