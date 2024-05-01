import React from "react"
import { useComics } from "../../context/ComicsContext"
import CommentsList from "./CommentsList"
import CommentForm from "./CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/comments"

function Comics() {
    const { comic, rootComments, createLocalComment } = useComics()
    const {
        loading,
        error,
        execute: createCommentFn,
    } = useAsyncFn(createComment)

    function onCommentCreate(message) {
        return createCommentFn({ comic_id: comic.comic_id, message }).then(
            createLocalComment
        )
    }

    return (
        <div>
            <img src={comic.cover_image_url} alt="comics_cover" />
            <h1>{comic.title}</h1>
            <p>{comic.description}</p>
            <div>
                <h3>Comments</h3>
                <div>
                    <CommentForm
                        loading={loading}
                        error={error}
                        handleSubmit={onCommentCreate}
                    />
                    {rootComments && rootComments.length > 0 ? (
                        <div>
                            <CommentsList comments={rootComments} />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default Comics
