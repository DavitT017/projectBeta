const ApiError = require("../exceptions/api-error")

module.exports = function (err, req, res, next) {
    console.error(err)

    if (err instanceof ApiError) {
        return res
            .status(err.status)
            .json({ message: err.message, errors: err.errors })
    }

    if (err.message.includes("inappropriate language")) {
        return res.status(400).json({ message: err.message })
    }

    if (err.message.includes("already exists")) {
        return res.status(409).json({ message: err.message })
    }

    return res.status(500).json({ message: "Unknown Error" })
}
