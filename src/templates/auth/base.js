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
            <span class="theme-icon">🌙</span>
          </button>
        </div>
      </header>
      ${bodyContent}
      <script>
        // Theme toggle logic...
      </script>
    </body>
    </html>
  `;
}
