// templates/admin/federationDashboard.js
export function federationDashboard(federatedPosts, domains, user, config) {
    return `
        <h2>🌐 Federation Network</h2>
        
        <div class="federation-stats">
            <div class="stat-card">
                <h3>${domains.length}</h3>
                <p>Connected Blogs</p>
            </div>
            <div class="stat-card">
                <h3>${federatedPosts.length}</h3>
                <p>Federated Posts</p>
            </div>
        </div>
        
        <div class="federation-actions">
            <button onclick="testFederation()">Test Federation</button>
            <button onclick="syncWithNetwork()">Sync Network</button>
        </div>
        
        <h3>Recent Posts from Network:</h3>
        ${federatedPosts.map(post => `
            <article class="federated-post">
                <h4><a href="${post.source_url}" target="_blank">${post.title}</a></h4>
                <p>by ${post.author} from ${post.source_domain}</p>
                <div class="post-content">${post.content.substring(0, 200)}...</div>
                <div class="post-actions">
                    <button onclick="replyToFederated('${post.id}')">Reply</button>
                    <button onclick="shareFederated('${post.id}')">Share</button>
                </div>
            </article>
        `).join('')}
    `;
}