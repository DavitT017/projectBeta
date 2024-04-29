import React from "react"
import { useParams } from "react-router-dom"
import { useComics } from "../../context/ComicsContext"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/comments"
import CommentForm from "./CommentForm"
import CommentList from "./CommentList"

function Comics() {
    const { comic_id } = useParams()
    const { comics, rootComments, createLocalComment } = useComics()
    const {
        loading,
        error,
        execute: createCommentFn,
    } = useAsyncFn(createComment)

    function onCommentCreate(message) {
        return createCommentFn({ comic_id, message }).then(createLocalComment)
    }

    return (
        <React.Fragment>
            <h1>{comics.title}</h1>
            <article>{comics.description}</article>
            <h3>Comments</h3>
            <div>
                <CommentForm
                    loading={loading}
                    error={error}
                    onSubmit={onCommentCreate}
                />
                {rootComments != null && rootComments.length > 0 && (
                    <div>
                        <CommentList comments={rootComments} />
                    </div>
                )}
            </div>
        </React.Fragment>
    )
}

export default Comics
