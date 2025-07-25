// scripts/cleanup.js
import fs from 'fs';
import path from 'path';

// Reset seed-db.sql to its original state
const originalContent = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

fs.writeFileSync(path.join(process.cwd(), 'scripts', 'seed-db.sql'), originalContent);
// Remove test-user.sql if it exists
try {
  fs.unlinkSync(path.join(process.cwd(), 'scripts', 'test-user.sql'));
} catch (e) {
  // Ignore if file doesn't exist
}
