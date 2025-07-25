// src/templates/auth/login.js
import { renderAuthTemplate } from './base.js';

export function renderLoginForm() {
  return renderAuthTemplate(
    'Login',
    `
    <div class="auth-container">
      <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    </div>
    `
  );
}