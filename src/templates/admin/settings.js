// src/templates/admin/settings.js
import { renderTemplate } from '../base.js';

export function renderSettings(settings, user) {
  const content = `
    <div class="settings-page">
      <h1>Site Settings</h1>
      
      <div class="info-box">
        <p><strong>Note:</strong> Settings are currently configured in <code>src/config.js</code>. 
        Dynamic settings coming soon!</p>
      </div>

      <div class="settings-grid">
        <div class="setting-group">
          <h3>General Settings</h3>
          <div class="setting-item">
            <label>Site Title</label>
            <div class="setting-value">${settings.title}</div>
          </div>
          <div class="setting-item">
            <label>Description</label>
            <div class="setting-value">${settings.description}</div>
          </div>
        </div>

        <div class="setting-group">
          <h3>Display Settings</h3>
          <div class="setting-item">
            <label>Posts Per Page</label>
            <div class="setting-value">${settings.postsPerPage}</div>
          </div>
          <div class="setting-item">
            <label>Date Format</label>
            <div class="setting-value">${settings.dateFormat}</div>
          </div>
        </div>

        <div class="setting-group">
          <h3>Environment</h3>
          <div class="setting-item">
            <label>Database</label>
            <div class="setting-value">D1 (SQLite at the edge)</div>
          </div>
          <div class="setting-item">
            <label>Deployment</label>
            <div class="setting-value">Cloudflare Workers</div>
          </div>
        </div>
      </div>

      <div class="future-settings">
        <h3>Coming Soon</h3>
        <ul>
          <li>Dynamic settings management</li>
          <li>Theme customization</li>
          <li>SEO configuration</li>
          <li>Email notifications</li>
          <li>Backup/Export options</li>
        </ul>
      </div>
    </div>
  `;

  return renderTemplate('Settings', content, user);
}
