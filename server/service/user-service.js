const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const pool = require('../db/db');

class UserService {
    async registration(username, email, password) {
        try {
            const emailQuery = 'SELECT * FROM users WHERE email = $1';
            const emailResult = await pool.query(emailQuery, [email]);
            if (emailResult.rows.length > 0) {
                throw ApiError.BadRequest(`User with email ${email} already exists`);
            }

            const hashPassword = await bcrypt.hash(password, 10);

            const activationLink = uuidv4(); // Use UUID for activation link

            const insertQuery = `
                INSERT INTO users (username, email, password_hash, current_roles, avatar_url, is_activated, activation_link) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, [username, email, hashPassword, '', '', false, activationLink]);

            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

            const userDto = new UserDto(insertResult.rows[0]); // Assuming UserDto constructor accepts an object

            const tokens = tokenService.generateTokens({ ...userDto });

            await tokenService.saveToken(userDto.user_id, tokens.refreshToken);

            return { ...tokens, user: userDto };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async activate(activationLink) {
        try {
            const query = 'SELECT * FROM users WHERE activation_link = $1';
            const result = await pool.query(query, [activationLink]);

            if (!result.rows.length) {
                throw ApiError.BadRequest('Invalid activation link');
            }

            // Update user activation status
            const user = result.rows[0];
            const updateQuery = 'UPDATE users SET is_activated = true WHERE user_id = $1';
            await pool.query(updateQuery, [user.user_id]);

            return 'User activated successfully';
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async login(username, email, password) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1 OR username = $2';
            const result = await pool.query(query, [email, username]);

            if (!result.rows.length) {
                throw ApiError.BadRequest('User with this email/username does not exist');
            }

            const user = result.rows[0];

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw ApiError.BadRequest('Invalid password');
            }

            // Create UserDto
            const userDto = new UserDto(user);

            // Generate tokens
            const tokens = tokenService.generateTokens({ ...userDto });

            // Save refresh token
            await tokenService.saveToken(userDto.user_id, tokens.refreshToken);

            return { ...tokens, user: userDto };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async logout(refreshToken) {
        try {
            await tokenService.removeToken(refreshToken);
            return 'Logout successful';
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async refresh(refreshToken) {
        try {
            if (!refreshToken) {
                throw ApiError.UnauthorizedError('Invalid refresh token');
            }

            // Validate refresh token
            const userData = tokenService.validateRefreshToken(refreshToken);
            if (!userData) {
                throw ApiError.UnauthorizedError('Invalid refresh token');
            }

            // Check if token exists in database
            const tokenFromDb = await tokenService.findToken(refreshToken);
            if (!tokenFromDb) {
                throw ApiError.UnauthorizedError('Invalid refresh token');
            }

            // Find user by id
            const userQuery = 'SELECT * FROM users WHERE user_id = $1';
            const userResult = await pool.query(userQuery, [userData.id]);

            if (!userResult.rows.length) {
                throw ApiError.UnauthorizedError('User not found');
            }

            const user = userResult.rows[0];

            // Create UserDto
            const userDto = new UserDto(user);

            // Generate tokens
            const tokens = tokenService.generateTokens({ ...userDto });

            // Save refresh token
            await tokenService.saveToken(userDto.user_id, tokens.refreshToken);

            return { ...tokens, user: userDto };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getAllUsers() {
        try {
            const query = 'SELECT * FROM users';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = new UserService();
