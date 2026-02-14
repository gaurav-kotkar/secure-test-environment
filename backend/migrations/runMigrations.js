const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  let connection;
  
  try {
    // First, create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✓ Database '${process.env.DB_NAME}' created or already exists`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create test_attempts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        attempt_id VARCHAR(255) UNIQUE NOT NULL,
        status ENUM('in_progress', 'submitted', 'completed') DEFAULT 'in_progress',
        violation_count INT DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Test attempts table created');

    // Create event_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data JSON,
        is_violation BOOLEAN DEFAULT FALSE,
        question_id VARCHAR(50),
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_attempt_id (attempt_id),
        INDEX idx_timestamp (timestamp)
      )
    `);
    console.log('✓ Event logs table created');

    // Insert example user (password: Test@123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password)
      VALUES ('John Doe', 'gaurav@ex.com', ?)
    `, [hashedPassword]);
    console.log('✓ Example user created (Email: gaurav@ex.com, Password: Test@123)');

    console.log('\n✓✓✓ All migrations completed successfully! ✓✓✓\n');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
