import React from "react"
import { useComics } from "../../context/ComicsContext"

function Comics() {
    const { comic } = useComics()

    return (
        <div>
            <img src={comic.cover_image_url} alt="comics_cover" />
            <h1>{comic.title}</h1>
            <p>{comic.description}</p>
            <div>
                <h3>Comments</h3>
            </div>
        </div>
    )
}

export default Comics
