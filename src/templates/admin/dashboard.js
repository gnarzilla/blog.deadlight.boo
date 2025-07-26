// src/templates/admin/dashboard.js
import { renderTemplate } from '../base.js';

export function renderAdminDashboard(stats, recentPosts, requestStats, user) {
  // Prepare data for the simple chart
  const chartData = requestStats.map(day => ({
    day: new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' }),
    requests: day.requests
  }));
  
  const maxRequests = Math.max(...chartData.map(d => d.requests), 1);

  const content = `
    <div class="admin-dashboard">
      <h1>Dashboard</h1>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Posts</h3>
          <div class="stat-number">${stats.total_posts || 0}</div>
        </div>
        <div class="stat-card">
          <h3>Total Users</h3>
          <div class="stat-number">${stats.total_users || 0}</div>
        </div>
        <div class="stat-card">
          <h3>Posts Today</h3>
          <div class="stat-number">${stats.posts_today || 0}</div>
        </div>
        <div class="stat-card">
          <h3>Weekly Requests</h3>
          <div class="stat-number">${stats.weekly_requests || 0}</div>
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

      <!-- Request Chart -->
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

      <!-- Recent Posts -->
      <div class="recent-posts-section">
        <h2>Recent Posts</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${recentPosts.map(post => `
              <tr>
                <td><a href="/post/${post.id}">${post.title}</a></td>
                <td>${post.author_username}</td>
                <td>${new Date(post.created_at).toLocaleDateString()}</td>
                <td>
                  <a href="/admin/edit/${post.id}" class="small-button">Edit</a>
                  <form action="/admin/delete/${post.id}" method="POST" style="display: inline;">
                    <button type="submit" class="small-button delete-button" 
                            onclick="return confirm('Delete this post?')">Delete</button>
                  </form>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return renderTemplate('Admin Dashboard', content, user);
}
