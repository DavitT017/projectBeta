import { makeRequest } from "./makeRequest"

export function createComment({ thread_id, message, parent_id }) {
    return makeRequest(`threads/${thread_id}/comments`, {
        method: "POST",
        data: { message, parent_id },
    })
}

export function updateComment({ thread_id, message, comment_id }) {
    return makeRequest(`threads/${thread_id}/comments/${comment_id}`, {
        method: "PUT",
        data: { message },
    }).catch((error) => {
        throw error
    })
}

export function deleteComment({ thread_id, comment_id }) {
    return makeRequest(`threads/${thread_id}/comments/${comment_id}`, {
        method: "DELETE",
    }).catch((error) => {
        throw error
    })
}

export function likeComment({ thread_id, comment_id }) {
    return makeRequest(`threads/${thread_id}/comments/${comment_id}/like`, {
        method: "POST",
    }).catch((error) => {
        throw error
    })
}

export function unlikeComment({ thread_id, comment_id }) {
    return makeRequest(`threads/${thread_id}/comments/${comment_id}/unlike`, {
        method: "POST",
    }).catch((error) => {
        throw error
    })
}
