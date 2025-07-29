// src/templates/auth/base.js
export function renderAuthTemplate(title, bodyContent) {
  return `
    <!DOCTYPE html>
    <html lang="en" data-theme="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="stylesheet" href="/styles/theme.css">
      <link rel="stylesheet" href="/styles/dark_min.css" id="theme-stylesheet">
    </head>
    <body>
      <header>
        <h1><a href="/">${title}</a></h1>
        <div class="theme-toggle-container">
          <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
            <span class="theme-icon">✧</span>
          </button>
        </div>
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
      </script>
    </body>
    </html>
  `;
}