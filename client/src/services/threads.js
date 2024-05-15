import { makeRequest } from "./makeRequest"

export function getThreads() {
	return makeRequest("/threads")
}

export function getAThread(thread_id) {
	return makeRequest(`/threads/${thread_id}`)
}

export function createThread({ title, description, thread_type }) {
	return makeRequest(`/threads`, {
		method: "POST",
		data: { title, description, thread_type },
	})
}

export function updateThread({ thread_id, title, description, thread_type }) {
	return makeRequest(`/threads/${thread_id}`, {
		method: "PUT",
		data: { title, description, thread_type },
	})
}

export function deleteThread(thread_id) {
	return makeRequest(`/threads/${thread_id}`, {
		method: "DELETE",
	})
}
