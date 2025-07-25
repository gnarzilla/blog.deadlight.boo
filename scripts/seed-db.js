// scripts/seed-db.js
import { hashPassword } from '../src/old/auth.js';

async function seedDatabase(env) {
  try {
    // Create tables if they don't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Generate password hash and salt for test user
    const password = 'testpass123';
    const { hash, salt } = await hashPassword(password);

    // Insert test user
    await env.DB.prepare(`
      INSERT OR IGNORE INTO users (username, password, salt)
      VALUES (?, ?, ?)
    `).bind('admin', hash, salt).run();

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export { seedDatabase };
