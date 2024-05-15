import React from "react"
import { useThread, handleRequestError } from "../../context/ThreadContext"
import CommentsList from "./ThreadCommentsList"
import CommentForm from "../Comments/CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/threadComments"

function Thread() {
    const { thread, rootComments, createLocalComment } = useThread()

    const {
        loading,
        error,
        execute: createCommentFn,
    } = useAsyncFn(createComment)

    function onCommentCreate(message) {
        return createCommentFn({ thread_id: thread.thread_id, message })
            .then(createLocalComment)
            .catch(handleRequestError)
    }
    return (
        <div>
            <div style={{ border: "1px solid" }}>
                <h1>{thread.title}</h1>
                <p>{thread.description}</p>
                <button>Edit</button>
            </div>
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

export default Thread
