import { makeRequest } from "./makeRequest"

export function createComment({ comic_id, message, parent_id }) {
    return makeRequest(`/comics/${comic_id}/comments`, {
        method: "POST",
        data: { message, parent_id },
    })
}

export function updateComment({ comic_id, message, id }) {
    return makeRequest(`/comics/${comic_id}/comments/${id}`, {
        method: "PUT",
        data: { message },
    })
}

export function deleteComment({ comic_id, id }) {
    return makeRequest(`/comics/${comic_id}/comments/${id}`, {
        method: "DELETE",
    })
}

export function toggleCommentLike({ id, comic_id }) {
    return makeRequest(`/comics/${comic_id}/comments/${id}/toggleLike`, {
        method: "POST",
    })
}
