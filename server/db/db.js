const { Pool } = require("pg")

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}
