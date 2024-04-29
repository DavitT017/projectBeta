import axios from "axios"

export async function makeRequest(url, options) {
    try {
        const res = await axios.get(url, options)
        return res.data
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error("Endpoint not found:", url)
            return await Promise.reject("Endpoint not found")
        } else {
            console.error("Request Error:", error)
            return await Promise.reject(error.response?.data?.message)
        }
    }
}
