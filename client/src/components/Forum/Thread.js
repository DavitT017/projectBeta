import React from "react"
import { useThread } from "../../context/ThreadContext"
import CommentsList from "./CommentsList"
import CommentForm from "./CommentForm"
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
        return createCommentFn({ thread_id: thread.thread_id, message }).then(
            createLocalComment
        )
    }

    return (
        <div>
            <div style={{ border: "1px solid" }}>
                <h1>{thread.title}</h1>
                <p>{thread.description}</p>
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
