
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
);

-- Insert admin user
INSERT INTO users (username, password, salt)
VALUES (
  'admin',
  '8fc45306fc96bf7be539b0dc4762e9c2abb6498dd2fe8041f3ca3d625930bc51',
  '8549c25740a308c20e2b3b090fac702b'
);