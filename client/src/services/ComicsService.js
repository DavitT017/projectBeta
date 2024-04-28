import { makeRequest } from "./makeRequest"

export function getAllComics() {
    return makeRequest("/comics")
}

export function getAComics(comic_id) {
    return makeRequest(`/comics/${comic_id}`)
}
