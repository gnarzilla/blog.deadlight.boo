# Deadlight Edge Bootstrap v3 - Secure, Modular Blog Platform for Cloudflare Workers (with v4 Roadmap)

A production-ready, security-hardened blog platform built on Cloudflare Workers. Features a modular architecture with a shared library system, comprehensive security controls, and everything you need for a modern blog. Deadlight aims to be the true WordPress alternative that respects both developers and readers by empowering self-ownership of your content and infrastructure – even your email. [Support is greatly appreciated! Buy me a coffee](coff.ee/gnarzillah)

🌐 Live Demo: [blog.deadlight.boo](https://blog.deadlight.boo)

✔️ Clone the repo
✔️ Create D1 database
✔️ Set up KV namespace
✔️ Deploy via Wrangler

<img width="1057" height="2102" alt="image" src="https://github.com/user-attachments/assets/36766575-eabd-4284-838a-1a87ba2ec096" />

<img width="1061" height="2102" alt="image" src="https://github.com/user-attachments/assets/1b5c106f-75fe-41bb-beff-a29910f5b230" />

## Admin Dashboard & Dynamic Settings

<img width="1427" height="1756" alt="image" src="https://github.com/user-attachments/assets/fbeda39b-5020-48fd-90e8-4aa7379c0034" />

<img width="1427" height="1424" alt="image" src="https://github.com/user-attachments/assets/836fa0fe-142b-4c4c-b169-ed72fe725789" />

## User Management

<img width="1576" height="1355" alt="image" src="https://github.com/user-attachments/assets/9fe70fb0-bbf2-4b41-accb-67db5a6b1189" />


## Features

| Feature           | WordPress | Ghost | Deadlight   |
| ----------------- | --------- | ----- | ----------- |
| Self-host on edge | ❌         | ❌     | ✅           |
| Email integration | ❌         | ⚠️    | ✅ (planned) |
| Zero tracking     | ⚠️        | ✅     | ✅           |
| Cloudflare-native | ❌         | ❌     | ✅           |
| Modular ecosystem | ❌         | ❌     | ✅           |


## What's New in v3:

🔐 **Enterprise-Grade Security**
- CSRF protection on all forms
- Rate limiting (configurable per endpoint)
- Input validation and sanitization
- Security headers middleware
- XSS prevention built-in

📦 **Modular Architecture**
- Shared `lib.deadlight` library
- Reusable components across projects
- Clean separation of concerns
- Ready for multi-app ecosystems

🛡️ **Enhanced Authentication**
- Improved JWT implementation
- Role-based access control (admin/editor/viewer)
- Secure session management
- Password complexity validation

📊 **Better Admin Experience**
- Dashboard with real-time stats
- User management interface
- Improved error handling
- Activity logging

🏗️ **Developer Experience**
- Comprehensive validation framework
- Structured logging system
- Database models with error handling
- Clean route organization

## Core Features (from v2):

+ Zero cold starts (edge computing!)
+ Multi-user authentication with JWT
+ Full Markdown support
+ Dark/Light theme switching
+ D1 Database (SQLite at the edge)
+ SEO-friendly URLs
+ Smart pagination
+ Post excerpts
+ Request logging (privacy-respecting)

## Quick Start

### Prerequisites
- Cloudflare account (free tier works)
- Node.js 20+
- Wrangler CLI (`npm install -g wrangler`)

### Deploy in 5 minutes

**Clone and install:**
```bash
git clone https://github.com/gnarzilla/blog.deadlight.boo.git
cd blog.deadlight.boo
npm install
```
### Create your D1 database:
```bash
wrangler d1 create blog_content
```

Update wrangler.toml with your database ID:
```bash
toml
[[d1_databases]]
binding = "DB"
database_name = "blog_content"
database_id = "your-database-id-here"
```

Initialize the database:

### Local development

```wrangler d1 execute blog_content --local --file=schema.sql```

### Production

```wrangler d1 execute blog_content --remote --file=schema.sql```


### Create KV namespace for rate limiting

```wrangler kv:namespace create "RATE_LIMIT"```

### Configure your domain and bindings in wrangler.toml:
```toml
[[routes]]
pattern = "yourdomain.com/*"
zone_id = "your-zone-id"

[[d1_databases]]
binding = "DB"
database_name = "blog_content_new"
database_id = "your-database-id-here"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your-kv-namespace-id"
```

## Set production secrets:

### Generate a secure JWT secret

```bash
openssl rand -base64 32
wrangler secret put JWT_SECRET
```

### Deploy:
```
bash
wrangler deploy
```
### Create your admin user:
```
bash
# Generate secure credentials
node scripts/generate-user.js

# Or manually via SQL
wrangler d1 execute blog_content_new --remote --command "INSERT INTO users (username, password_hash, role) VALUES ('admin', 'your-hash-here', 'admin')"

# Add to production database
wrangler d1 execute blog_content --remote --command "INSERT INTO users (username, password, salt) VALUES ('admin', 'hash-here', 'salt-here')"
```
## Project Structure:
```
deadlight/
├── blog.deadlight/          # Main blog application
│   └── src/
│       ├── index.js         # Main entry & routing
│       ├── config.js        # Site configuration
│       ├── routes/          # Route handlers
│       │   ├── admin.js     # Admin routes (CRUD + users)
│       │   ├── auth.js      # Login/logout with CSRF
│       │   ├── blog.js      # Public blog routes
│       │   ├── inbox.js     # Inbox routing
│       │   └── styles.js    # CSS delivery
│       ├── templates/       # HTML templates
│       └── utils/           # App-specific utilities
│
└── lib.deadlight/          # Shared library
    └── core/
        ├── auth/           # Authentication system
        │   ├── jwt.js      # JWT handling
        │   ├── password.js # Bcrypt hashing
        │   └── errors.js   # Auth errors
        ├── db/             # Database layer
        │   ├── models/     # Data models
        │   └── migrations.js
        ├── security/       # Security features
        │   ├── validation.js # Input validation
        │   ├── ratelimit.js  # Rate limiting
        │   ├── headers.js    # Security headers
        │   └── middleware.js
        ├── logging/        # Logging system
        └── markdown/       # Markdown processing
```

## Security Features

### Authentication & Authorization
- JWT-based sessions with secure cookies
- Role-based access control (admin, editor, viewer)
- Secure password hashing with bcrypt
- Session expiration and renewal

### Request Security
- CSRF protection on all state-changing operations
- Rate limiting with configurable windows
- Input validation and sanitization
- XSS prevention in templates
- Security headers (CSP, X-Frame-Options, etc.)

### Data Protection
- Parameterized queries (no SQL injection)
- HTML escaping in outputs
- Markdown sanitization
- Secure cookie flags


## Configuration

Edit `src/config.js` to customize:

- Site title and description
- Posts per page
- Date formatting
- Theme defaults
- Security settings

### Common Tasks
Add a new user
```
bash
### Via admin interface (when logged in as admin)
https://your-site/admin/users/add

### Via script
node scripts/create-user.js username password role
```

### Customize styling
Edit theme variables in src/routes/styles.js. The CSS uses variables for easy customization.

### Add custom routes
1. Create route handler in src/routes/
2. Register in src/index.js
3. Add templates as needed

### Adjust security settings
- Rate limits: Edit lib.deadlight/core/src/security/ratelimit.js
- Validation rules: Edit lib.deadlight/core/src/security/validation.js
- Security headers: Edit lib.deadlight/core/src/security/headers.js

## Ecosystem Roadmap (v4 and Beyond)

Deadlight is not just a blog; it's a vision for a self-sovereign digital ecosystem. The following modules are under active development or consideration to expand its capabilities while maintaining its core principles of modularity, privacy, and user control.

## Coming Soon (Actively in Development)
-📧 comm.deadlight - Integrated Email Client/Server:
Our most ambitious upcoming feature, comm.deadlight aims to provide a robust email solution for your domain (e.g., you@deadlight.boo) without relying on major third-party email providers. This enables true self-ownership of your communications.
* Hybrid Approach: Leverages Cloudflare Workers for the email application logic, processing, and storage (via KV/Durable Objects).
* SMTP Handling: Integrates with a lightweight, dedicated SMTP endpoint (potentially your custom Python solution or proxy.deadlight) responsible for sending and receiving raw email protocols.
* Scalability & Reliability: For production-level reliability and prompt delivery, a small, inexpensive Virtual Private Server (VPS) is recommended for the SMTP endpoint, providing a static public IP and 24/7 availability.
* Free-Tier Exploration: We are actively exploring solutions that minimize cost, including methods for personal, low-volume use that might run on local hardware (like a Raspberry Pi) and leverage SMTP retry mechanisms, with clear documentation about the trade-offs in reliability. This allows for adoption without immediate financial commitment, while offering a clear upgrade path for critical use.
-🔀 proxy.deadlight - Privacy Proxy Service:
A flexible, lightweight network proxy (written in C, with potential for other language implementations) designed to facilitate secure and private communication.
* Email Bridge: Can function as a crucial component of comm.deadlight, bridging raw email protocols (SMTP/IMAP) to HTTP endpoints accessible by Cloudflare Workers.
* Protocol Flexibility: Enables Cloudflare Workers to interact with services that typically require raw TCP/UDP connections.
* Portable Executable: Designed to be highly portable, allowing it to run on diverse hardware (from a VPS to a Raspberry Pi or even your local machine), offering deployment flexibility for specific use cases (e.g., local synchronization or less critical email handling).

## Future Considerations
-📊 Analytics service (privacy-first)
-💬 Comments system (no tracking)
-🖼️ Media management with R2
-📱 Mobile app API
-🔌 Plugin system
- 🌐 ActivityPub support


## Migration from v2
1. Export your posts: wrangler d1 execute blog_content --local --command "SELECT * FROM posts"
2. Update your wrangler.toml with new bindings
3. Run the v3 schema: wrangler d1 execute blog_content_new --local --file=schema.sql
4. Import your data (script coming soon)
5. Test locally before deploying

## API Documentation
### Public Endpoints
- GET / - Home page with posts
- GET /post/:id - Individual post
- GET /login - Login form
- POST /login - Authenticate

### Protected Endpoints (require auth)
- GET /admin - Admin dashboard
- GET /admin/add - New post form
- POST /admin/add - Create post
- GET /admin/edit/:id - Edit post form
- POST /admin/edit/:id - Update post
- POST /admin/delete/:id - Delete post
- GET /admin/users - User management
- POST /admin/users/add - Create user
- POST /admin/users/delete/:id - Delete user

## Security Headers
All responses include:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy (configurable)

## Contributing
This is an open source project! Contributions welcome:
```
🐛 Report bugs via issues
💡 Suggest features
🔧 Submit PRs for fixes
📖 Improve documentation
🎨 Create themes
🌍 Add translations
🔒 Security audit
```

## License
MIT - Use this however you want!

## Acknowledgments
Built with Cloudflare Workers, D1, and KV
Security patterns inspired by OWASP guidelines
Thanks to the Cloudflare Workers community
Maintained with ❤️ and Diet Mountain Dew

## Support
💬 Discussions
🐛 Issues
☕ [Buy me a coffee](coff.ee/gnarzillah)
