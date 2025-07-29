// src/templates/base.js
import { siteConfig } from '../config.js';

export function renderTemplate(title, bodyContent, user = null) {
  const pageTitle = title === 'home' ? siteConfig.title : `${title} | ${siteConfig.title}`;
  
  const authLinks = user 
   ? `
    <a href="/admin">Dashboard</a> |
    <a href="/admin/add">Create New Post</a> |
    <a href="/login">Login</a> |
    <a href="/logout">Logout</a>
    `
  : `<a href="/login">Login</a>`;

  return `
    <!DOCTYPE html>
    <html lang="en" data-theme="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pageTitle}</title>
      <link rel="stylesheet" href="/styles/theme.css">
      <link rel="stylesheet" href="/styles/dark_min.css" id="theme-stylesheet">
    </head>
    <body>
      <header>
        <h1><a href="/">${siteConfig.title}</a></h1>
        <nav>
          ${authLinks}
          <div class="theme-toggle-container">
            <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
              <span class="theme-icon">✵</span>
            </button>
          </div>
        </nav>
      </header>
      ${bodyContent}
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const themeToggle = document.getElementById('theme-toggle');
          const html = document.documentElement;
          const stylesheet = document.getElementById('theme-stylesheet');
          
          // Load saved theme
          let currentTheme = localStorage.getItem('theme') || 'dark';
          html.setAttribute('data-theme', currentTheme);
          stylesheet.href = '/styles/' + currentTheme + '_min.css';

          // Update theme icon
          const themeIcon = themeToggle.querySelector('.theme-icon');
          themeIcon.textContent = currentTheme === 'dark' ? '♧' : '◇';
          
          // Handle theme toggle
          themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Update localStorage
            localStorage.setItem('theme', currentTheme);
            
            // Update HTML attribute
            html.setAttribute('data-theme', currentTheme);
            
            // Update stylesheet
            stylesheet.href = '/styles/' + currentTheme + '_min.css';
            
            // Update icon
            themeIcon.textContent = currentTheme === 'dark' ? '♡' : '♤';
          });
        });

        // Keyboard navigation for pagination (moved outside of theme toggle)
        document.addEventListener('keydown', (e) => {
          // Don't interfere with form inputs
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          
          if (e.key === 'ArrowLeft') {
            const prevLink = document.querySelector('.pagination-prev');
            if (prevLink && !prevLink.classList.contains('pagination-disabled')) {
              prevLink.click();
            }
          } else if (e.key === 'ArrowRight') {
            const nextLink = document.querySelector('.pagination-next');
            if (nextLink && !nextLink.classList.contains('pagination-disabled')) {
              nextLink.click();
            }
          }
        });
      </script>
    </body>
    </html>
  `;
}