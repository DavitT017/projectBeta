import { makeAutoObservable } from "mobx"
import AuthService from "../services/AuthService"

export default class Store {
    user = {}
    isAuth = false

    constructor() {
        makeAutoObservable(this)
    }

    setAuth(bool) {
        this.isAuth = bool
    }

    setUser(user) {
        this.user = user
    }

    async login({ emailOrUsername, password }) {
        try {
            const response = await AuthService.login(emailOrUsername, password)
            localStorage.setItem("token", response.data.accessToken)
            this.setAuth(true)
            this.setUser(response.data.user)
        } catch (e) {
            console.log("Error while logging in", e.response?.data?.message)
        }
    }

    async registration({ email, username, password }) {
        try {
            const response = await AuthService.registration(
                email,
                username,
                password
            )
            localStorage.setItem("token", response.data.accessToken)
            this.setAuth(true)
            this.setUser(response.data.user)
        } catch (e) {
            console.log("Error while registration", e.response?.data?.message)
        }
    }

    async logout() {
        try {
            await AuthService.logout()
            localStorage.removeItem("token")
            this.setAuth(false)
            this.setUser({})
        } catch (e) {
            console.log("Error while logging out", e.response?.data?.message)
        }
    }
}
