import axios from "axios"

const $api = axios.create({
    withCredentials: true,
    baseURL: "http://localhost:5000/api",
})

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`
    return config
})

$api.interceptors.response.use(
    (config) => {
        return config
    },
    async (error) => {
        const originalRequest = error.config
        if (
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry
        ) {
            originalRequest._isRetry = true
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/refresh",
                    {
                        withCredentials: true,
                    }
                )
                localStorage.setItem("token", response.data.accessToken)
                return $api.request(originalRequest)
            } catch (e) {
                console.log("Not Authorized", e)
            }
        }
        throw error
    }
)

export default $api
