import { renderTemplate } from './base.js';

export function renderLandingPage(config = null) {
  const content = `
    <div class="landing-container">
      <header class="hero">
        <h1>Deadlight</h1>
        <p class="tagline">A secure, minimalist blogging platform for thoughtful writers</p>
      </header>
      
      <section class="features">
        <div class="feature-grid">
          <div class="feature">
            <h3>Your Own Space</h3>
            <p>Get your own subdomain like <code>you.deadlight.boo</code> for your writing</p>
          </div>
          <div class="feature">
            <h3>Text-First</h3>
            <p>Focus on words. Markdown supported, no distracting media uploads</p>
          </div>
          <div class="feature">
            <h3>Privacy Focused</h3>
            <p>Built on Cloudflare's edge network with security as a priority</p>
          </div>
        </div>
      </section>
      
      <section class="invite-request">
        <h2>Request an Invite</h2>
        <form method="POST" action="/request-invite" class="invite-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="username">Desired Username</label>
            <input type="text" id="username" name="username" 
                   pattern="[a-z0-9-]+" title="Only lowercase letters, numbers, and hyphens"
                   placeholder="will-be-your-subdomain" required>
            <small>This will be your subdomain: <strong id="preview">username</strong>.deadlight.boo</small>
          </div>
          
          <div class="form-group">
            <label for="reason">Why do you want to join?</label>
            <textarea id="reason" name="reason" rows="4" 
                      placeholder="Tell us a bit about what you'd like to write about..." required></textarea>
          </div>
          
          <button type="submit" class="button primary">Request Invite</button>
        </form>
      </section>
    </div>
    
    <script>
      // Live preview of subdomain
      document.getElementById('username').addEventListener('input', function(e) {
        document.getElementById('preview').textContent = e.target.value || 'username';
      });
    </script>
  `;

  return renderTemplate('Deadlight - Secure Blogging Platform', content, null, config);
}