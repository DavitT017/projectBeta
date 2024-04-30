import React from "react"
import { getComics } from "../../services/comics"
import { NavLink } from "react-router-dom"
import { useAsync } from "../../hooks/useAsync"

export const ComicsList = () => {
    const { loading, error, value: comics } = useAsync(getComics)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>{error}</h1>
    if (!comics) return null

    return comics.map((comic) => (
        <h1 key={comic.comic_id}>
            <NavLink
                style={{ textDecoration: "none", color: "red" }}
                to={`/comics/${comic.comic_id}`}
            >
                {comic.title}
            </NavLink>
        </h1>
    ))
}
