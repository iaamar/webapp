const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 8080;
const DB_NAME = process.env.DB_DATABASE || 'healthcare';
const TABLE_NAME = 'accounts'; // You can update this table name based on your requirements

// Admin pool to connect to the default 'postgres' database
const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Default database to create/check the target database
});

// PostgreSQL connection pool for the target database
let pool;

// Function to check if the target database exists and create it if it doesn't
async function checkOrCreateDatabase() {
    try {
        // Check if the target database exists
        const { rows } = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname=$1`, [DB_NAME]);
        if (rows.length > 0) {
            console.log(`Database '${DB_NAME}' already exists.`);
        } else {
            // Create the database if it doesn't exist
            await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
            console.log(`Database '${DB_NAME}' created successfully.`);
        }

        // Initialize connection to the target database after creation or existence check
        pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: DB_NAME
        });

        return true;
    } catch (error) {
        console.error('Failed to check or create the database:', error);
        return false;
    }
}

// Function to check if the specified table exists and create it if it doesn't
async function checkOrCreateTable() {
    try {
        const { rows } = await pool.query(`SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1;`, [TABLE_NAME]);
        if (rows.length > 0) {
            console.log(`Table "${TABLE_NAME}" already exists.`);
        } else {
            // Create the table if it doesn't exist
            await pool.query(`
                CREATE TABLE ${TABLE_NAME} (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log(`Table "${TABLE_NAME}" created successfully.`);
        }
        return true;
    } catch (error) {
        console.error('Failed to check or create the table:', error);
        return false;
    }
}

// Health check endpoint
app.get('/healthz', async (req, res) => {
    try {
        // Check the database connection
        await pool.query('SELECT 1');
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        });
        res.status(200).send("HTTP 200 OK\n");
    } catch (error) {
        res.status(503).set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }).send("HTTP 503 Service Unavailable\n");
    }
});

// Middleware to ensure only GET requests are allowed for the /healthz route
app.use('/healthz', (req, res, next) => {
    if (req.method !== 'GET') {
        return res.status(405).set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }).send("HTTP 405 Method Not Allowed\n");
    }
    next();
});

// Start the server and check/create database and table if necessary
async function startServer() {
    const dbCreated = await checkOrCreateDatabase();
    if (dbCreated) {
        const tableCreated = await checkOrCreateTable();
        if (tableCreated) {
            app.listen(port, () => {
                console.log(`Server running on http://localhost:${port}`);
            });
        } else {
            console.log('Table creation failed.');
        }
    } else {
        console.log('Database creation failed.');
    }
}

// Initialize the server
startServer();
