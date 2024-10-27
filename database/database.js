const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let sslCa;
if (process.env.SSL_CERT_CONTENT) {
    sslCa = process.env.SSL_CERT_CONTENT;
    console.log('Using SSL certificate from SSL_CERT_CONTENT environment variable');
} else if (process.env.SSL_CERT_PATH) {
    try {
        // Resolve the path relative to the project root
        const projectRoot = path.resolve(__dirname, '..');
        const certPath = path.join(projectRoot, process.env.SSL_CERT_PATH);
        console.log(`Attempting to read SSL certificate from: ${certPath}`);
        sslCa = fs.readFileSync(certPath);
        console.log('Successfully read SSL certificate file');
    } catch (error) {
        console.error('Error reading SSL certificate file:', error.message);
        console.error('Current working directory:', process.cwd());
        console.error('Please ensure the SSL_CERT_PATH is correct and the file exists.');
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
};

if (sslCa) {
    console.log('Adding SSL configuration to database connection');
    dbConfig.ssl = {
        ca: sslCa
    };
} else {
    console.log('SSL configuration not added to database connection');
}

async function getConnection() {
    try {
        console.log('Attempting to connect to database...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected to database');
        return connection;
    } catch (error) {
        if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
            console.error('SSL Certificate Error:', error.message);
            console.error('Please check if your SSL certificate is valid and up-to-date.');
        } else if (error.code === 'ER_SSL_CONNECTION_ERROR') {
            console.error('SSL Connection Error:', error.message);
            console.error('Unable to establish SSL connection. Check your SSL configuration.');
        } else {
            console.error('Error connecting to the database:', error);
        }
        throw error;
    }
}

module.exports = { getConnection };