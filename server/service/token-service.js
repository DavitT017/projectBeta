const jwt = require("jsonwebtoken")
const pool = require("../db/db")

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
            expiresIn: "2h",
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "30d",
        })
        return {
            accessToken,
            refreshToken,
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async saveToken(user_id, refreshToken) {
        try {
            // Check if token exists for the user
            const tokenQuery = "SELECT * FROM tokens WHERE user_id = $1"
            const tokenResult = await pool.query(tokenQuery, [user_id])
            if (tokenResult.rows.length > 0) {
                const updateQuery =
                    "UPDATE tokens SET refresh_token = $1 WHERE user_id = $2"
                await pool.query(updateQuery, [refreshToken, user_id])
            } else {
                // Create new token
                const insertQuery =
                    "INSERT INTO tokens (user_id, refresh_token) VALUES ($1, $2)"
                await pool.query(insertQuery, [user_id, refreshToken])
            }

            return { user_id: user_id, refresh_token: refreshToken }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async removeToken(refreshToken) {
        try {
            const deleteQuery = "DELETE FROM tokens WHERE refresh_token = $1"
            await pool.query(deleteQuery, [refreshToken])
            return "Token removed"
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async findToken(refreshToken) {
        try {
            const query = "SELECT * FROM tokens WHERE refresh_token = $1"
            const result = await pool.query(query, [refreshToken])
            return result.rows[0]
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = new TokenService()
