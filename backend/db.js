const mysql = require('mysql2');

// Create a connection pool for better performance and reliability
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'alumnex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Wrap pool in promise-based API for async/await usage
const db = pool.promise();

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database: alumnex');
    connection.release();
});

module.exports = db;
