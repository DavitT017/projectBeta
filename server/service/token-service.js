const jwt = require("jsonwebtoken")
const pool = require("../config/dbConfig")

class TokenService {
    async saveToken(userId, refreshToken) {
        const client = await pool.connect()
        try {
            await client.query("BEGIN")

            const checkTokenQuery = "SELECT * FROM tokens WHERE user_id = $1"
            const checkTokenValues = [userId]
            const { rows } = await client.query(
                checkTokenQuery,
                checkTokenValues
            )
            if (rows.length > 0) {
                const updateTokenQuery =
                    "UPDATE tokens SET refresh_token = $1 WHERE user_id = $2 RETURNING *"
                const updateTokenValues = [refreshToken, userId]
                await client.query(updateTokenQuery, updateTokenValues)
                await client.query("COMMIT")
                return rows[0]
            }

            const insertTokenQuery =
                "INSERT INTO tokens (user_id, refresh_token) VALUES ($1, $2) RETURNING *"
            const insertTokenValues = [userId, refreshToken]
            const newToken = await client.query(
                insertTokenQuery,
                insertTokenValues
            )

            await client.query("COMMIT")
            return newToken.rows[0]
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    }

    async removeToken(refreshToken) {
        const client = await pool.connect()
        try {
            await client.query("BEGIN")

            const deleteTokenQuery =
                "DELETE FROM tokens WHERE refresh_token = $1"
            const deleteTokenValues = [refreshToken]
            await client.query(deleteTokenQuery, deleteTokenValues)

            await client.query("COMMIT")
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        } finally {
            client.release()
        }
    }

    async findToken(refreshToken) {
        const client = await pool.connect()
        try {
            const findTokenQuery =
                "SELECT * FROM tokens WHERE refresh_token = $1"
            const findTokenValues = [refreshToken]
            const { rows } = await client.query(findTokenQuery, findTokenValues)
            return rows[0]
        } finally {
            client.release()
        }
    }
}

module.exports = new TokenService()
