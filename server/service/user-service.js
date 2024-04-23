const pool = require("../config/dbConfig")
const bcrypt = require("bcrypt")
const uuid = require("uuid")
const mailService = require("./mail-service")
const tokenService = require("./token-service")
const UserDto = require("../dtos/user-dto")
const ApiError = require("../exceptions/api-error")

class UserService {
    async registration(username, email, password) {
        try {
            const client = await pool.connect()
            await client.query("BEGIN")

            const checkUserQuery =
                "SELECT * FROM Users WHERE email = $1 OR username = $2"
            const checkUserValues = [email, username]
            const { rows } = await client.query(checkUserQuery, checkUserValues)
            if (rows.length > 0) {
                throw ApiError.BadRequest(
                    `User with ${email} email or ${username} username already exists`
                )
            }

            const hashPassword = await bcrypt.hash(password, 10)
            const user_id = uuid.v4() // or any other method to generate a unique id

            const createUserQuery =
                "INSERT INTO Users (user_id, username, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *"
            const createUserValues = [user_id, username, email, hashPassword]
            const newUser = await client.query(
                createUserQuery,
                createUserValues
            )

            // Your activation email logic goes here

            await client.query("COMMIT")

            const userDto = new UserDto(newUser.rows[0]) // id, email, isActivated
            const tokens = tokenService.generateTokens({ ...userDto })
            await tokenService.saveToken(userDto.id, tokens.refreshToken)

            client.release()
            return { ...tokens, user: userDto }
        } catch (error) {
            await client.query("ROLLBACK")
            throw error
        }
    }

    async activate(activationLink) {
        const client = await pool.connect()
        const findUserQuery = "SELECT * FROM users WHERE activation_link = $1"
        const findUserValues = [activationLink]
        const { rows } = await client.query(findUserQuery, findUserValues)
        if (rows.length === 0) {
            throw ApiError.BadRequest("Incorrect activation key")
        }
        const updateUserQuery =
            "UPDATE users SET is_activated = true WHERE id = $1"
        const updateUserValues = [rows[0].id]
        await client.query(updateUserQuery, updateUserValues)
        client.release()
    }

    async login(email, password) {
        const client = await pool.connect()
        const findUserQuery = "SELECT * FROM users WHERE email = $1"
        const findUserValues = [email]
        const { rows } = await client.query(findUserQuery, findUserValues)
        if (rows.length === 0) {
            throw ApiError.BadRequest("User with that email doesn't exist")
        }
        const user = rows[0]
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest("Wrong Password")
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        client.release()
        return { ...tokens, user: userDto }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const client = await pool.connect()
        const findUserQuery = "SELECT * FROM users WHERE id = $1"
        const findUserValues = [userData.id]
        const { rows } = await client.query(findUserQuery, findUserValues)
        const user = rows[0]
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        client.release()
        return { ...tokens, user: userDto }
    }

    async getAllUsers() {
        const client = await pool.connect()
        const getUsersQuery = "SELECT * FROM users"
        const { rows } = await client.query(getUsersQuery)
        client.release()
        return rows
    }
}

module.exports = new UserService()
