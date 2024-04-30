const ApiError = require("../exceptions/api-error")
const tokenService = require("../service/token-service")

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError())
        }

        const accessToken = authorizationHeader.split(" ")[1]
        if (!accessToken) {
            return next(ApiError.UnauthorizedError())
        }

        const userData = tokenService.validateAccessToken(accessToken)
        if (!userData) {
            return next(ApiError.UnauthorizedError())
        }

        if (!userData.isActivated) {
            return next(ApiError.ForbiddenError("User is not activated"))
        }

        req.user = userData
        req.user = userData.user_id
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
