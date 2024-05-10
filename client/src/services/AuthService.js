import $api from "../http/index"

export default class AuthService {
    static async login(username, email, password) {
        try {
            return await $api.post("/login", { username, email, password })
        } catch (error) {
            throw error?.response?.data?.message ?? "Error"
        }
    }

    static async registration(username, email, password) {
        try {
            return await $api.post("/registration", {
                username,
                email,
                password,
            })
        } catch (error) {
            throw error?.response?.data?.message ?? "Error"
        }
    }

    static async logout() {
        return await $api.post("/logout")
    }
}
