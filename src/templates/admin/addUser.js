// src/templates/admin/addUser.js
import { renderTemplate } from '../base.js';

export function renderAddUserForm(user = null, config = null) {
  const content = `
    <div class="auth-container">
      <h2>Add New User</h2>
      <form method="POST">
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          required
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          required
          minlength="8"
        />
        <select name="role" required>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create User</button>
        <a href="/admin/users" style="display: block; text-align: center; margin-top: 1rem;">Cancel</a>
      </form>
    </div>
  `;

  return renderTemplate('Add User', content, user, config);
}