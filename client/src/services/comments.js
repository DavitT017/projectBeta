import { makeRequest } from "./makeRequest"

export function createComment({ comic_id, message, parent_id }) {
    return makeRequest(`comics/${comic_id}/comments`, {
        method: "POST",
        data: { message, parent_id },
    })
}
