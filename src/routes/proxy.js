// src/routes/proxy.js - Updated for deadlight blog integration
import { ProxyService } from '../services/proxy.js';
import { proxyDashboardTemplate } from '../templates/admin/proxyDashboard.js';

export async function handleProxyRoutes(request, env, user) {
    try {
        // Get dynamic config
        const { configService } = await import('../services/config.js');
        const config = await configService.getConfig(env.DB);

        // Initialize proxy service with config
        const proxyUrl = env.PROXY_URL || config.proxyUrl || 'http://localhost:8080';
        const proxyService = new ProxyService({ PROXY_URL: proxyUrl });

        // Fetch proxy status data
        const [blogStatus, emailStatus, healthCheck] = await Promise.allSettled([
            proxyService.getBlogStatus(),
            proxyService.getEmailStatus(),
            proxyService.healthCheck()
        ]);

        const proxyData = {
            status: healthCheck.status === 'fulfilled' ? healthCheck.value : { proxy_connected: false, error: healthCheck.reason?.message },
            blogApi: blogStatus.status === 'fulfilled' ? blogStatus.value : { error: blogStatus.reason?.message },
            emailApi: emailStatus.status === 'fulfilled' ? emailStatus.value : { error: emailStatus.reason?.message },
            config: {
                proxyUrl,
                enabled: true
            }
        };

        return new Response(proxyDashboardTemplate(proxyData, user, config), {
            headers: { 'Content-Type': 'text/html' }
        });

    } catch (error) {
        console.error('Proxy dashboard error:', error);
        const errorData = { 
            error: error.message,
            status: { proxy_connected: false }
        };
        
        // Get config for fallback
        const { configService } = await import('../services/config.js');
        const config = await configService.getConfig(env.DB);
        
        return new Response(proxyDashboardTemplate(errorData, user, config), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Proxy test handlers
export const handleProxyTests = {
    async testBlogApi(request, env) {
        try {
            const proxyUrl = env.PROXY_URL || 'http://localhost:8080';
            const proxyService = new ProxyService({ PROXY_URL: proxyUrl });
            const result = await proxyService.getBlogStatus();
            return Response.json({ success: true, data: result });
        } catch (error) {
            console.error('Blog API test error:', error);
            return Response.json({ success: false, error: error.message });
        }
    },

    async testEmailApi(request, env) {
        try {
            const proxyUrl = env.PROXY_URL || 'http://localhost:8080';
            const proxyService = new ProxyService({ PROXY_URL: proxyUrl });
            const result = await proxyService.getEmailStatus();
            return Response.json({ success: true, data: result });
        } catch (error) {
            console.error('Email API test error:', error);
            return Response.json({ success: false, error: error.message });
        }
    },

    async testFederation(request, env) {
        try {
            const proxyUrl = env.PROXY_URL || 'http://localhost:8080';
            const proxyService = new ProxyService({ PROXY_URL: proxyUrl });
            const testData = { 
                message: 'Test federation message from Cloudflare Worker',
                timestamp: new Date().toISOString(),
                source: 'deadlight-blog'
            };
            const result = await proxyService.sendFederatedPost(testData);
            return Response.json({ success: true, data: result });
        } catch (error) {
            console.error('Federation test error:', error);
            return Response.json({ success: false, error: error.message });
        }
    },

    async sendTestEmail(request, env) {
        try {
            const { email } = await request.json();
            const proxyUrl = env.PROXY_URL || 'http://localhost:8080';
            const proxyService = new ProxyService({ PROXY_URL: proxyUrl });
            
            const emailData = {
                to: email,
                from: 'noreply@deadlight.boo',
                subject: 'Test Email from Deadlight Proxy',
                body: `Hello!\n\nThis is a test email sent through the Deadlight Proxy system.\n\nTimestamp: ${new Date().toISOString()}\n\nBest regards,\nDeadlight System`
            };
            
            const result = await proxyService.sendEmail(emailData);
            return Response.json({ success: true, data: result });
        } catch (error) {
            console.error('Test email error:', error);
            return Response.json({ success: false, error: error.message });
        }
    }
};