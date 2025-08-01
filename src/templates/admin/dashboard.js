// src/templates/admin/dashboard.js
import { renderTemplate } from '../base.js';

export function renderAdminDashboard(stats, posts, requestStats = [], user) {  // Added requestStats parameter
  // Prepare data for the simple chart
  const chartData = requestStats && requestStats.length > 0 
    ? requestStats.map(day => ({
        day: new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' }),
        requests: day.requests
      }))
    : [];
  
  const maxRequests = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.requests), 1)
    : 1;

  return `
    <!DOCTYPE html>
    <html lang="en" data-theme="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - ${user.username}</title>
      <link rel="stylesheet" href="/styles/theme.css">
      <link rel="stylesheet" href="/styles/dark_min.css" id="theme-stylesheet">
    </head>
    <body>
      <header>
        <h1><a href="/">deadlight.boo</a></h1>
        <nav>
          <a href="/admin" class="active">Dashboard</a>
          <span class="nav-separator">|</span>
          <a href="/admin/add">Create New Post</a>
          <span class="nav-separator">|</span>
          <a href="/admin/users">Manage Users</a>
          <span class="nav-separator">|</span>
          <a href="/">View Blog</a>
          <span class="nav-separator">|</span>
          <a href="/logout">Logout</a>
          <div class="theme-toggle-container">
            <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
              <span class="theme-icon">✵</span>
            </button>
          </div>
        </nav>
      </header>

      <div class="container">
        <div class="page-header">
          <h1>Dashboard</h1>
        </div>
        
        <div class="admin-dashboard">
          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>TOTAL POSTS</h3>
              <div class="stat-number">${stats.totalPosts}</div>
            </div>
            <div class="stat-card">
              <h3>TOTAL USERS</h3>
              <div class="stat-number">${stats.totalUsers || 0}</div>
            </div>
            <div class="stat-card">
              <h3>POSTS TODAY</h3>
              <div class="stat-number">${stats.postsToday || 0}</div>
            </div>
            <div class="stat-card">
              <h3>PUBLISHED</h3>
              <div class="stat-number">${stats.publishedPosts || 0}</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
              <a href="/admin/add" class="button">Create New Post</a>
              <a href="/admin/users" class="button">Manage Users</a>
              <a href="/admin/settings" class="button">Settings</a>
              <a href="/" class="button">View Blog</a>
            </div>
          </div>

          <!-- Request Chart - ADD THIS SECTION -->
          ${chartData.length > 0 ? `
            <div class="chart-section">
              <h2>Requests (Last 7 Days)</h2>
              <div class="simple-chart">
                ${chartData.map(data => `
                  <div class="chart-bar" style="--height: ${(data.requests / maxRequests) * 100}%">
                    <div class="bar"></div>
                    <div class="label">${data.day}</div>
                    <div class="value">${data.requests}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Recent Posts -->
          <div class="recent-posts-section">
            <h2>Recent Posts</h2>
            ${posts.length > 0 ? `
              <table class="data-table">
                <thead>
                  <tr>
                    <th>TITLE</th>
                    <th>AUTHOR</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  ${posts.map(post => `
                    <tr>
                      <td>
                        <a href="/post/${post.slug || post.id}" class="post-title-link">${post.title}</a>
                      </td>
                      <td>${post.author_username || 'Unknown'}</td>
                      <td>${new Date(post.created_at).toLocaleDateString()}</td>
                      <td>${post.published ? '<span class="badge">Published</span>' : 'Draft'}</td>
                      <td class="action-cell">
                        <a href="/admin/edit/${post.id}" class="button small-button edit-button">Edit</a>
                        <form action="/admin/delete/${post.id}" method="POST" style="display: inline;">
                          <button type="submit" class="button small-button delete-button" 
                                  onclick="return confirm('Delete this post?')">Delete</button>
                        </form>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="empty-state">
                <p>No posts yet.</p>
                <a href="/admin/add" class="button">Create your first post</a>
              </div>
            `}
          </div>
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const themeToggle = document.getElementById('theme-toggle');
          const html = document.documentElement;
          const stylesheet = document.getElementById('theme-stylesheet');
          
          let currentTheme = localStorage.getItem('theme') || 'dark';
          html.setAttribute('data-theme', currentTheme);
          stylesheet.href = '/styles/' + currentTheme + '_min.css';

          const themeIcon = themeToggle.querySelector('.theme-icon');
          themeIcon.textContent = currentTheme === 'dark' ? '♧' : '◇';
          
          themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            html.setAttribute('data-theme', currentTheme);
            stylesheet.href = '/styles/' + currentTheme + '_min.css';
            themeIcon.textContent = currentTheme === 'dark' ? '♡' : '♤';
          });
        });
      </script>
    </body>
    </html>
  `;
}