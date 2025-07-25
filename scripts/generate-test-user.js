// scripts/generate-test-user.js
import { hashPassword, verifyPassword } from '../src/utils/auth.js';

// Base SQL for creating tables
const baseSql = `
-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- Create users table first (parent table)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table with foreign key
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

async function generateTestUserCredentials() {
  try {
    const password = 'testpass123';
    // Use console.error for logs so they don't go to stdout
    console.error('Generating credentials for password:', password);
    
    const { hash, salt } = await hashPassword(password);
    
    // Log to stderr
    console.error('Generated credentials:', {
      password,
      hashStart: hash.substring(0, 10),
      hashLength: hash.length,
      saltStart: salt.substring(0, 10),
      saltLength: salt.length
    });

    // Store these values for verification
    const testVerify = await verifyPassword(password, hash, salt);
    console.error('Verification test:', { testVerify });

    // Only write SQL to stdout
    const fullSql = `${baseSql}

-- Insert admin user
INSERT INTO users (username, password, salt)
VALUES (
  'admin',
  '${hash}',
  '${salt}'
);`;

    process.stdout.write(fullSql);
  } catch (error) {
    console.error('Error generating credentials:', error);
    process.exit(1);
  }
}

generateTestUserCredentials();