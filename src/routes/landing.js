// src/routes/landing.js
import { renderLandingPage } from '../templates/landing.js';
import { renderTemplate } from '../templates/base.js';
import { configService } from '../services/config.js';

async function handleInviteRequest(request, env) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const username = formData.get('username');
    const reason = formData.get('reason');
    
    // Basic validation
    if (!email || !username || !reason) {
      throw new Error('All fields are required');
    }
    
    // Store invite request in KV for admin review
    const inviteRequest = {
      email,
      username,
      reason,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    await env.KV.put(`invite_request:${email}`, JSON.stringify(inviteRequest));
    
    // Simple success page
    const successContent = `
      <div class="success-container">
        <h1>Request Submitted!</h1>
        <p>Thanks for your interest in Deadlight Edge. We'll review your request and get back to you soon.</p>
        <a href="/" class="button">Back to Home</a>
      </div>
    `;
    
    const service = new configService(env.KV);
    const config = await service.getConfig();
    return new Response(renderTemplate('Request Submitted', successContent, null, config), {
      headers: { 'Content-Type': 'text/html' }
    });
    
  } catch (error) {
    console.error('Invite request error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}

export const landingRoutes = {
  '/landing': {
    GET: async (request, env) => {
      console.log('Landing route called');
      try {
        const service = new configService(env.KV);
        const config = await service.getConfig();
        console.log('Landing page config loaded:', config);
        return new Response(renderLandingPage(config), {
          headers: { 'Content-Type': 'text/html' }
        });
      } catch (error) {
        console.error('Landing page error:', error);
        return new Response('Error: ' + error.message, { status: 500 });
      }
    }
  },
  
  '/request-invite': {
    POST: handleInviteRequest
  }
};