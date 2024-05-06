import { makeRequest } from "./makeRequest"

export function createComment({ comic_id, message, parent_id }) {
    return makeRequest(`comics/${comic_id}/comments`, {
        method: "POST",
        data: { message, parent_id },
    })
}

export function updateComment({ comic_id, message, comment_id }) {
    return makeRequest(`comics/${comic_id}/comments/${comment_id}`, {
        method: "PUT",
        data: { message },
    })
}

export function deleteComment({ comic_id, comment_id }) {
    return makeRequest(`comics/${comic_id}/comments/${comment_id}`, {
        method: "DELETE",
    })
}
