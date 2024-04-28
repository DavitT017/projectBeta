import React from "react"
import { NavLink } from "react-router-dom"
import { useAsync } from "../../hooks/useAsync"
import { getAllComics } from "../../services/ComicsService"

function ComicsList() {
    const { loading, error, value: comics } = useAsync(getAllComics)

    if (loading) return <h1>Loading</h1>
    if (error) return <h1>{error}</h1>

    return comics.map((comic) => {
        return (
            <h1 key={comic.id}>
                <NavLink to={`/comics/${comic.id}`}>{comic.title}</NavLink>
            </h1>
        )
    })
}

export default ComicsList
