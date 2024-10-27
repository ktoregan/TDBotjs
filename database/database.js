const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let sslCa;

// Check if SSL_CERT_CONTENT is provided in base64, otherwise use SSL_CERT_PATH
if (process.env.SSL_CERT_CONTENT) {
    // Decode the base64 SSL certificate content
    sslCa = Buffer.from(process.env.SSL_CERT_CONTENT, 'base64').toString('utf-8');
    console.log('Using SSL certificate from SSL_CERT_CONTENT environment variable');
} else if (process.env.SSL_CERT_PATH) {
    try {
        // Resolve and read SSL certificate file from the path
        const projectRoot = path.resolve(__dirname, '..');
        const certPath = path.join(projectRoot, process.env.SSL_CERT_PATH);
        console.log(`Attempting to read SSL certificate from: ${certPath}`);
        sslCa = fs.readFileSync(certPath, 'utf-8');
        console.log('Successfully read SSL certificate file');
    } catch (error) {
        console.error('Error reading SSL certificate file:', error.message);
        console.error('Please ensure SSL_CERT_PATH is correct and the file exists.');
    }
} else {
    console.log('No SSL certificate configuration found. Will attempt to connect without SSL.');
}

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT,
    ssl: sslCa ? { ca: sslCa } : undefined // Add SSL configuration if sslCa is defined
};

async function getConnection() {
    try {
        console.log('Attempting to connect to database...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected to database');
        return connection;
    } catch (error) {
        if (['CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'ER_SSL_CONNECTION_ERROR'].includes(error.code)) {
            console.error('SSL Certificate Error:', error.message);
            console.error('Please check if your SSL certificate is valid and up-to-date.');
        } else {
            console.error('Error connecting to the database:', error);
        }
        throw error;
    }
}

module.exports = { getConnection };