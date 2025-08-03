// script to inject emails from JSON files into the blog_content D1 database
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to email JSON files from comm.deadlight CLI prototype
const emailsDir = path.join(process.env.HOME, 'comm.deadlight', 'emails');

// Function to escape SQL values (basic, to prevent injection)
function escapeSql(value) {
  return value.replace(/'/g, "''");
}

fs.readdirSync(emailsDir).forEach(file => {
  if (file.endsWith('.json')) {
    try {
      const emailPath = path.join(emailsDir, file);
      const emailData = JSON.parse(fs.readFileSync(emailPath, 'utf8'));
      // Create metadata JSON for email-specific fields
      const metadata = JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        message_id: emailData.message_id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        date: emailData.date || new Date().toISOString()
      });
      // Check if email already exists (basic deduplication by message_id in metadata)
      const checkCmd = `wrangler d1 execute blog_content --local --command "SELECT id FROM posts WHERE email_metadata LIKE '%${emailData.message_id}%' LIMIT 1;"`;
      const checkResult = execSync(checkCmd).toString();
      if (!checkResult.includes('"id":')) {
        // Insert into posts table as an email
        const insertCmd = `wrangler d1 execute blog_content --local --command "INSERT INTO posts (title, content, slug, author_id, created_at, updated_at, published, is_email, email_metadata) VALUES ('${escapeSql(emailData.subject)}', '${escapeSql(emailData.body)}', 'email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}', 1, '${emailData.date || new Date().toISOString()}', '${new Date().toISOString()}', 0, 1, '${escapeSql(metadata)}');"`;
        execSync(insertCmd);
        console.log(`Injected email: ${file}`);
      } else {
        console.log(`Skipped existing email: ${file}`);
      }
    } catch (err) {
      console.error(`Error injecting ${file}:`, err.message);
    }
  }
});
console.log('Email injection complete.');
