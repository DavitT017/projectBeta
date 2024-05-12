const jwt = require("jsonwebtoken")

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const { refreshToken } = req.cookies
            if (!refreshToken) {
                return res.status(403).json({ message: "Not Authorized" })
            }
            const { current_roles } = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            )
            let hasRole = false
            roles.forEach((roles) => {
                if (current_roles == roles) {
                    hasRole = true
                }
            })
            if (!hasRole) {
                return res.status(403).json({ message: "You Have No Access" })
            }
            next()
        } catch (e) {
            console.log(e)
            return res.status(403).json({ message: "Not Authorized" })
        }
    }
}
