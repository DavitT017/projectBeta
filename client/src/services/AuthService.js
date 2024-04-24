import $api from "../http/index"

export default class AuthService {
    static async login(username, email, password) {
        return $api.post("/login", { username, email, password })
    }

    static async registration(username, email, password) {
        return $api.post("/registration", { username, email, password })
    }

    static async logout() {
        return $api.post("/logout")
    }
}
