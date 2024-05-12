const ApiError = require("../exceptions/api-error")
module.exports = function (err, req, res, next) {
    console.error(err)

    if (err instanceof ApiError) {
        return res
            .status(err.status)
            .send({ message: err.message, errors: err.errors })
    }

    if (err.message.includes("inappropriate language")) {
        return res.status(400).send({ message: err.message })
    }

    if (err.message.includes("already exists")) {
        return res.status(409).send({ message: err.message })
    }

    if (err.message.includes("does not exist")) {
        return res.status(400).send({ message: err.message })
    }

    if (err.message.includes("password")) {
        return res.status(401).send({ message: err.message })
    }

    return res.status(500).send({ message: "Unknown Error" })
}
