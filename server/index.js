require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { Pool } = require("pg")
const router = require("./router/index")
const errorMiddleware = require("./middlewares/error-middleware")

const PORT = process.env.PORT || 5000
const app = express()

// PostgreSQL connection pool setup
const pool = new Pool({
    connectionString: process.env.DB_POOL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
    })
)
app.use("/api", router)
app.use(errorMiddleware)

const start = async () => {
    try {
        // Start listening only when the connection pool is ready
        await pool.connect()
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (e) {
        console.error("Error connecting to PostgreSQL:", e)
    }
}

start()
