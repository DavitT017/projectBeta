import $api from "../http/index"

export default class AuthService {
    static async login(emailOrUsername, password) {
        return $api.post("/login", { emailOrUsername, password })
    }

    static async registration(email, username, password) {
        return $api.post("/registration", { email, username, password })
    }

    static async logout() {
        return $api.post("/logout")
    }
}
