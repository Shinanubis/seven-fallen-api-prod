const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

module.exports = pool;