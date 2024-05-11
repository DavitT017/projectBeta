import { makeRequest } from "./makeRequest"

export function getThreads() {
    return makeRequest("/threads")
}

export function getAThread(thread_id) {
    return makeRequest(`/threads/${thread_id}`)
}
