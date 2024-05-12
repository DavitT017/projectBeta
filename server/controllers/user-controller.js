const userService = require("../service/user-service")
const { validationResult } = require("express-validator")
const ApiError = require("../exceptions/api-error")

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(
                    ApiError.BadRequest("Validation error", errors.array())
                )
            }
            const { username, email, password } = req.body
            const userData = await userService.registration(
                username,
                email,
                password
            )
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            })

            res.cookie("userId", userData.user.user_id)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { username, email, password } = req.body
            const userData = await userService.login(username, email, password)
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            })

            res.cookie("userId", userData.user.user_id)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const token = await userService.logout(refreshToken)
            res.clearCookie("refreshToken")
            res.clearCookie("accessToken")
            res.clearCookie("userId")
            return res.json(token)
        } catch (e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link
            await userService.activate(activationLink)
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userData = await userService.refresh(refreshToken)
            res.cookie("refreshToken", userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            })
            res.cookie("userId", userData.user.user_id)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async blockUser(req, res, next) {
        try {
            const userId = req.params.id
            const result = await userService.blockUser(userId)
            return res.json({ message: result })
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
