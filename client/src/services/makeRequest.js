import axios from "axios"

export async function makeRequest(url, options) {
    try {
        const res = await axios.get(url, options)
        return res.data
    } catch (error) {
        return await Promise.reject(error.response?.data?.message)
    }
}
