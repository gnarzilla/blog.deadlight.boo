// src/routes/styles.js

const CACHE_HEADERS = {
  'Content-Type': 'text/css',
  'Cache-Control': 'public, max-age=3600'
};

// Base styles that work for both themes
const baseStyles = `
  /* CSS Variables for theming */
  :root {
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --max-width: 900px;
    --border-radius: 4px;
    --transition: all 0.2s ease;
  }

  /* Base Reset */
  * {
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 20px;
    line-height: 1.6;
  }

  /* Layout */
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 20px;
  }

  .auth-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Header */
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  header h1 {
    margin: 0;
    font-size: 1.8rem;
  }

  header h1 a {
    color: var(--text-primary);
    text-decoration: none;
  }

  /* Navigation */
  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  nav a {
    color: var(--link-color);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  nav a:hover {
    background-color: var(--nav-hover-bg);
    color: var(--nav-hover-color);
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
    margin-top: 0;
  }

  a {
    color: var(--link-color);
    text-decoration: none;
    transition: var(--transition);
  }

  a:hover {
    color: var(--link-hover);
    text-decoration: underline;
  }

  /* Forms */
  input, textarea {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid var(--input-border);
    background-color: var(--input-bg);
    color: var(--text-primary);
    font-size: 1em;
    border-radius: var(--border-radius);
    font-family: var(--font-family);
  }

  textarea {
    min-height: 200px;
    resize: vertical;
  }

  /* Buttons - Ensure consistency */
  button,
  .button,
  a.button,
  .edit-button,
  .delete-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    margin: 0;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    font-family: var(--font-family);
  }

  /* Primary button style */
  button:not(.delete-button),
  .button:not(.edit-button):not(.delete-button) {
    background-color: var(--button-primary-bg);
    color: var(--button-primary-text);
  }

  button:not(.delete-button):hover,
  .button:not(.edit-button):not(.delete-button):hover {
    background-color: var(--button-primary-hover);
  }

  /* Edit buttons */
  .edit-button,
  a.edit-button {
    background-color: var(--button-secondary-bg);
    color: var(--button-secondary-text);
  }

  .edit-button:hover,
  a.edit-button:hover {
    background-color: var(--button-secondary-hover);
    color: var(--button-secondary-text);
  }

  /* Delete buttons */
  .delete-button,
  button.delete-button,
  .delete-link button {
    background-color: var(--button-danger-bg);
    color: var(--button-danger-text);
  }

  .delete-button:hover,
  button.delete-button:hover,
  .delete-link button:hover {
    background-color: var(--button-danger-hover);
    color: var(--button-danger-text);
  }

  /* Post Styles */
  article,
  .post-preview {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }

  article:last-child,
  .post-preview:last-child {
    border-bottom: none;
  }

  article h2,
  .post-preview h2 {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .post-preview h2 a {
    color: var(--text-primary);
    text-decoration: none;
  }

  .post-preview h2 a:hover {
    color: var(--link-color);
  }

  .post-meta {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  /* Add to baseStyles */
  .post-excerpt {
    margin: 1rem 0;
    color: var(--text-color);
    line-height: 1.6;
    max-width: 100%;  /* Ensure it doesn't overflow */
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-secondary);
    margin-bottom: 1rem;
  }

  /* For really long single-line excerpts */
  .post-excerpt p {
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  time {
    color: var(--text-secondary);
  }

  /* Post Content */
  .post-content {
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .post-content h1 { font-size: 2em; margin: 0.67em 0; }
  .post-content h2 { font-size: 1.5em; margin: 0.83em 0; }
  .post-content h3 { font-size: 1.17em; margin: 1em 0; }
  .post-content h4 { font-size: 1em; margin: 1.33em 0; }
  .post-content h5 { font-size: 0.83em; margin: 1.67em 0; }
  .post-content h6 { font-size: 0.67em; margin: 2.33em 0; }

  .post-content pre {
    background: var(--code-bg);
    padding: 1rem;
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin: 1em 0;
  }

  .post-content code {
    background: var(--code-bg);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  .post-content blockquote {
    border-left: 4px solid var(--border-color);
    margin: 1em 0;
    padding-left: 1em;
    color: var(--text-secondary);
  }

  /* Post actions container */
  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    flex-wrap: nowrap;  /* Prevent wrapping */
  }

  .post-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;  /* Prevent shrinking */
  }

  .delete-link {
    display: inline-flex;
    margin: 0;
  }

  .read-more {
    color: var(--link-color);
    font-weight: 500;
  }

  /* Single Post */
  .single-post {
    max-width: 800px;
    margin: 0 auto;
  }

  .single-post .post-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .single-post h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .single-post .post-content {
    font-size: 1.1rem;
    line-height: 1.8;
  }

  .single-post .post-actions {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

  /* Post Navigation */
  .post-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

  .nav-prev, .nav-next {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: var(--text-primary);
    max-width: 45%;
  }

  .nav-next {
    text-align: right;
    align-items: flex-end;
  }

  .nav-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .nav-title {
    font-weight: 500;
    color: var(--text-primary);
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
    padding: 1rem;
  }

  .pagination-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    transition: var(--transition);
    font-weight: 500;
  }

  .pagination-link:hover:not(.pagination-disabled):not(.pagination-current) {
    background-color: var(--bg-secondary);
    border-color: var(--border-hover);
    text-decoration: none;
  }

  .pagination-current {
    background-color: var(--button-primary-bg);
    color: var(--button-primary-text);
    border-color: var(--button-primary-bg);
  }

  .pagination-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Theme Toggle - back to bottom right */
  .theme-toggle-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }


  .theme-toggle {
    background-color: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  }

  .theme-toggle:hover {
    transform: scale(1.05);
  }

  /* Messages */
  .success-message,
  .error-message {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: var(--border-radius);
  }

  .success-message {
    background-color: var(--success-bg);
    color: var(--success-text);
    border: 1px solid var(--success-border);
  }

  .error-message {
    background-color: var(--error-bg);
    color: var(--error-text);
    border: 1px solid var(--error-border);
  }

  /* Mobile */
  @media (max-width: 600px) {
    body {
      padding: 10px;
    }
    
    .container {
      padding: 10px;
    }
    
    header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
    
    nav {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  /* Admin Dashboard */
  .admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    text-align: center;
  }

  .stat-card h3 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--text-primary);
  }

  .quick-actions {
    margin-bottom: 3rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  /* Simple Chart */
  .chart-section {
    margin-bottom: 3rem;
  }

  .simple-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 200px;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    gap: 0.5rem;
  }

  .chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    height: 100%;
  }

  .chart-bar .bar {
    width: 100%;
    background: var(--button-primary-bg);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    height: var(--height);
    transition: height 0.3s ease;
  }

  .chart-bar .label {
    font-size: 0.75rem;
    margin-top: 0.5rem;
    color: var(--text-secondary);
  }

  .chart-bar .value {
    position: absolute;
    bottom: calc(var(--height) + 0.25rem);
    font-size: 0.75rem;
    font-weight: bold;
  }

  /* Data Table */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .data-table th,
  .data-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  .data-table th {
    background: var(--bg-primary);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 0.875rem;
  }

  .data-table tr:last-child td {
    border-bottom: none;
  }

  .data-table tr:hover {
    background: var(--bg-primary);
  }

  .small-button {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    margin-right: 0.5rem;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .simple-chart {
      padding: 0.5rem;
    }
    
    .chart-bar .value {
      font-size: 0.625rem;
    }
    
    .data-table {
      font-size: 0.875rem;
    }
    
    .data-table th,
    .data-table td {
      padding: 0.5rem;
    }
  }

  /* Page Header */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  /* Badge */
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    background: var(--button-primary-bg);
    color: var(--button-primary-text);
    border-radius: var(--border-radius);
    margin-left: 0.5rem;
  }

  /* Info Box */
  .info-box {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin: 2rem 0;
  }

  .info-box p {
    margin: 0;
    color: var(--text-secondary);
  }

  /* Settings */
  .settings-grid {
    display: grid;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .setting-group {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
  }

  .setting-group h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }

  .setting-item {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }

  .setting-item:last-child {
    margin-bottom: 0;
  }

  .setting-item label {
    font-weight: 500;
    color: var(--text-secondary);
  }

  .setting-value {
    color: var(--text-primary);
  }

  .future-settings ul {
    list-style: none;
    padding: 0;
  }

  .future-settings li {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  .muted {
    color: var(--text-secondary);
  }
  `;

  // Dark theme variables
  const darkTheme = `
    :root[data-theme="dark"] {
      /* Colors */
      --bg-primary: #000;
      --bg-secondary: #1a1a1a;
      --text-primary: #fff;
      --text-secondary: #888;
      --border-color: #333;
      --border-hover: #555;
      
      /* Links */
      --link-color: #8ba3c7;
      --link-hover: #adc3e7;
      
      /* Navigation */
      --nav-hover-bg: #333;
      --nav-hover-color: #fff;
      
      /* Buttons - monochrome only */
      --button-primary-bg: #333;
      --button-primary-text: #fff;
      --button-primary-hover: #555;
      
      --button-secondary-bg: #444;  /* Edit button - slightly lighter */
      --button-secondary-text: #fff;
      --button-secondary-hover: #666;
      
      --button-danger-bg: #614f4fff;  /* Delete button - pure black */
      --button-danger-text: #fff;
      --button-danger-hover: #ada6a6;
      
      /* Forms */
      --input-bg: #121212;
      --input-border: #333;
      
      /* Code */
      --code-bg: #1a1a1a;
      
      /* Messages */
      --success-bg: #0a4f0a;
      --success-text: #90ee90;
      --success-border: #0f7f0f;
      
      --error-bg: #4f0a0a;
      --error-text: #ff9090;
      --error-border: #7f0f0f;
    }
  `;

  // Light theme variables
  const lightTheme = `
    :root[data-theme="light"] {
      /* Colors */
      --bg-primary: #fff;
      --bg-secondary: #f5f5f5;
      --text-primary: #333;
      --text-secondary: #666;
      --border-color: #ddd;
      --border-hover: #999;
      
      /* Links */
      --link-color: #0066cc;
      --link-hover: #0052a3;
      
      /* Navigation */
      --nav-hover-bg: #f0f0f0;
      --nav-hover-color: #333;
      
      /* Buttons - monochrome only */
      --button-primary-bg: #333;
      --button-primary-text: #fff;
      --button-primary-hover: #555;
      
      --button-secondary-bg: #666;  /* Edit button - grey */
      --button-secondary-text: #fff;
      --button-secondary-hover: #888;
      
      --button-danger-bg: #000;  /* Delete button - black in light mode too */
      --button-danger-text: #fff;
      --button-danger-hover: #333;
      
      /* Forms */
      --input-bg: #fff;
      --input-border: #ccc;
      
      /* Code */
      --code-bg: #f4f4f4;
      
      /* Messages */
      --success-bg: #d4edda;
      --success-text: #155724;
      --success-border: #c3e6cb;
      
      --error-bg: #f8d7da;
      --error-text: #721c24;
      --error-border: #f5c6cb;
    }
`;

export const styleRoutes = {
  '/styles/dark_min.css': {
    GET: () => new Response(baseStyles + darkTheme, { 
      headers: CACHE_HEADERS 
    })
  },
  '/styles/light_min.css': {
    GET: () => new Response(baseStyles + lightTheme, { 
      headers: CACHE_HEADERS 
    })
  },
  '/styles/theme.css': {
    GET: () => new Response(baseStyles + darkTheme, {
      headers: CACHE_HEADERS 
    })
  }
};