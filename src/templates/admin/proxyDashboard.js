// src/templates/admin/proxyDashboard.js - Updated for deadlight blog integration
import { renderTemplate } from '../base.js';

export function proxyDashboardTemplate(proxyData, user, config) {
    const { status, blogApi, emailApi, error } = proxyData;
    
    const content = `
        <div class="proxy-dashboard">
            <div class="dashboard-header">
                <h2>🔀 Proxy Server Management</h2>
                <div class="status-indicator ${status?.proxy_connected ? 'connected' : 'disconnected'}">
                    ${status?.proxy_connected ? '🟢 Connected to Proxy' : '🔴 Proxy Disconnected'}
                </div>
            </div>

            ${error ? `
                <div class="error-banner">
                    <h3>⚠️ Connection Error</h3>
                    <p>${error}</p>
                    <p><strong>Proxy URL:</strong> ${proxyData.config?.proxyUrl || 'Not configured'}</p>
                    <button onclick="window.location.reload()" class="button retry-btn">Retry Connection</button>
                </div>
            ` : ''}

            <div class="proxy-services-grid">
                <!-- Blog API Status -->
                <div class="service-card">
                    <h3>📝 Blog API</h3>
                    <div class="service-status ${blogApi?.status === 'running' ? 'healthy' : 'error'}">
                        Status: ${blogApi?.status || 'Unknown'}
                    </div>
                    ${blogApi?.version ? `<p><strong>Version:</strong> ${blogApi.version}</p>` : ''}
                    ${blogApi?.error ? `<p class="error-text">Error: ${blogApi.error}</p>` : ''}
                    <button onclick="testBlogApi()" class="button test-btn">Test Blog API</button>
                </div>

                <!-- Email API Status -->  
                <div class="service-card">
                    <h3>📧 Email API</h3>
                    <div class="service-status ${emailApi?.status === 'running' ? 'healthy' : 'error'}">
                        Status: ${emailApi?.status || 'Unknown'}
                    </div>
                    ${emailApi?.queue_size !== undefined ? `<p><strong>Queue Size:</strong> ${emailApi.queue_size}</p>` : ''}
                    ${emailApi?.last_processed ? `<p><strong>Last Processed:</strong> ${emailApi.last_processed}</p>` : ''}
                    ${emailApi?.error ? `<p class="error-text">Error: ${emailApi.error}</p>` : ''}
                    <button onclick="testEmailApi()" class="button test-btn">Test Email API</button>
                </div>

                <!-- Federation Status -->
                <div class="service-card">
                    <h3>🌐 Decentralized Federation</h3>
                    <div class="service-status healthy">
                        Email-based Social Media
                    </div>
                    <p><strong>Protocol:</strong> Email Bridge</p>
                    <p><strong>Purpose:</strong> Instance-to-instance communication</p>
                    <button onclick="testFederation()" class="button test-btn">Test Federation</button>
                </div>

                <!-- Proxy Configuration -->
                <div class="service-card">
                    <h3>⚙️ Configuration</h3>
                    <p><strong>Proxy URL:</strong> ${proxyData.config?.proxyUrl || 'Not configured'}</p>
                    <p><strong>Connection:</strong> ${status?.proxy_connected ? 'Active' : 'Inactive'}</p>
                    ${status?.timestamp ? `<p><strong>Last Check:</strong> ${new Date(status.timestamp).toLocaleString()}</p>` : ''}
                    <button onclick="window.location.reload()" class="button secondary">Refresh Status</button>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="proxy-actions">
                <h3>⚡ Quick Actions</h3>
                <div class="action-buttons">
                    <button onclick="sendTestEmail()" class="button action-btn">Send Test Email</button>
                    <button onclick="publishTestPost()" class="button action-btn">Publish Test Post</button>
                    <button onclick="federateTestMessage()" class="button action-btn">Test Federation</button>
                    <button onclick="refreshAllStatus()" class="button secondary">Refresh All Status</button>
                </div>
            </div>

            <!-- Integration Guide -->
            <div class="integration-guide">
                <h3>📖 Integration Guide</h3>
                <div class="guide-section">
                    <h4>Email Integration</h4>
                    <p>Your proxy server bridges SMTP protocol to HTTP API calls, enabling your Cloudflare Worker to handle email seamlessly.</p>
                    
                    <h4>Federation Features</h4>
                    <p>Enable decentralized social media by allowing blog instances to communicate via email protocols, avoiding ActivityPub complexity.</p>
                    
                    <h4>SOCKS5 Privacy</h4>
                    <p>Your proxy also provides SOCKS5 capabilities for privacy and bypassing restrictions.</p>
                </div>
            </div>
        </div>

        <style>
            .proxy-dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .status-indicator { padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
            .status-indicator.connected { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .status-indicator.disconnected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .proxy-services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .service-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
            .service-status { font-weight: bold; margin: 10px 0; }
            .service-status.healthy { color: #28a745; }
            .service-status.error { color: #dc3545; }
            .error-text { color: #dc3545; font-size: 14px; }
            .test-btn, .action-btn { margin-top: 10px; margin-right: 10px; }
            .proxy-actions, .integration-guide { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 20px; }
            .action-buttons { display: flex; flex-wrap: wrap; gap: 10px; }
            .error-banner { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #f5c6cb; }
            .guide-section h4 { color: #495057; margin-top: 15px; margin-bottom: 8px; }
            .guide-section p { color: #6c757d; line-height: 1.5; }
        </style>

        <script>
            async function testBlogApi() {
                try {
                    showLoading('Testing Blog API...');
                    const response = await fetch('/admin/proxy/test-blog-api');
                    const result = await response.json();
                    hideLoading();
                    alert('Blog API Test: ' + (result.success ? '✅ Success!' : '❌ Failed - ' + result.error));
                } catch (error) {
                    hideLoading();
                    alert('❌ Test failed: ' + error.message);
                }
            }

            async function testEmailApi() {
                try {
                    showLoading('Testing Email API...');
                    const response = await fetch('/admin/proxy/test-email-api');
                    const result = await response.json();
                    hideLoading();
                    alert('Email API Test: ' + (result.success ? '✅ Success!' : '❌ Failed - ' + result.error));
                } catch (error) {
                    hideLoading();
                    alert('❌ Test failed: ' + error.message);
                }
            }

            async function testFederation() {
                try {
                    showLoading('Testing Federation...');
                    const response = await fetch('/admin/proxy/test-federation');
                    const result = await response.json();
                    hideLoading();
                    alert('Federation Test: ' + (result.success ? '✅ Success!' : '❌ Failed - ' + result.error));
                } catch (error) {
                    hideLoading();
                    alert('❌ Test failed: ' + error.message);
                }
            }

            async function sendTestEmail() {
                const email = prompt('Enter test email address:');
                if (email) {
                    try {
                        showLoading('Sending test email...');
                        const response = await fetch('/admin/proxy/send-test-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                        });
                        const result = await response.json();
                        hideLoading();
                        alert('Test email: ' + (result.success ? '✅ Sent successfully!' : '❌ Failed - ' + result.error));
                    } catch (error) {
                        hideLoading();
                        alert('❌ Failed: ' + error.message);
                    }
                }
            }

            async function publishTestPost() {
                try {
                    showLoading('Publishing test post...');
                    // This would integrate with your existing post creation
                    const testPost = {
                        title: 'Test Post from Proxy Dashboard',
                        content: 'This is a test post created through the proxy dashboard integration.',
                        published: true
                    };
                    
                    // You could call your proxy API or directly create a post
                    alert('✅ Test post functionality - this would create a post via proxy API');
                    hideLoading();
                } catch (error) {
                    hideLoading();
                    alert('❌ Failed: ' + error.message);
                }
            }

            async function federateTestMessage() {
                const domain = prompt('Enter target domain for federation test (e.g., otherblog.com):');
                if (domain) {
                    try {
                        showLoading('Testing federation...');
                        // This demonstrates the federated social media concept
                        const federationData = {
                            target_domain: domain,
                            message: 'Hello from deadlight.boo! Testing email-based federation.',
                            type: 'test_message'
                        };
                        
                        const response = await fetch('/admin/proxy/test-federation', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(federationData)
                        });
                        const result = await response.json();
                        hideLoading();
                        alert('Federation test: ' + (result.success ? '✅ Message sent!' : '❌ Failed - ' + result.error));
                    } catch (error) {
                        hideLoading();
                        alert('❌ Federation failed: ' + error.message);
                    }
                }
            }

            function refreshAllStatus() {
                showLoading('Refreshing proxy status...');
                window.location.reload();
            }

            function showLoading(message) {
                // Create or update loading indicator
                let loading = document.getElementById('loading-indicator');
                if (!loading) {
                    loading = document.createElement('div');
                    loading.id = 'loading-indicator';
                    loading.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 10px 15px; border-radius: 4px; z-index: 1000;';
                    document.body.appendChild(loading);
                }
                loading.textContent = message;
                loading.style.display = 'block';
            }

            function hideLoading() {
                const loading = document.getElementById('loading-indicator');
                if (loading) {
                    loading.style.display = 'none';
                }
            }

            // Auto-refresh status every 30 seconds
            setInterval(refreshAllStatus, 30000);
        </script>
    `;

    return renderTemplate('Proxy Server Management', content, user, config);
}