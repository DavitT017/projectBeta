import React, { useState } from "react"
import { handleRequestError, useThread } from "../../context/ThreadContext"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/threadComments"
import { deleteThread, updateThread } from "../../services/threads"
import CommentForm from "../Comments/CommentForm"
import CommentsList from "./ThreadCommentsList"
import { useNavigate } from "react-router-dom"
import ThreadForm from "./ThreadForm"

function Thread() {
    const navigate = useNavigate()

    const {
        thread: initialThread,
        rootComments,
        createLocalComment,
    } = useThread()
    const [thread, setThread] = useState(initialThread)

    const {
        loading: updateLoading,
        error: updateError,
        execute: updateThreadFn,
    } = useAsyncFn(updateThread)

    const {
        loading: deleteLoading,
        error: deleteError,
        execute: deleteThreadFn,
    } = useAsyncFn(deleteThread)

    const [isEditing, setIsEditing] = useState(false)
    const [editMessage, setEditMessage] = useState(thread.description)

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

    const onEditClick = () => {
        if (isEditing) {
            setEditMessage(editMessage)
        } else {
            setEditMessage(thread.description)
        }
        setIsEditing(!isEditing)
    }

    function onThreadUpdate(values) {
        const updatedThread = { ...thread, ...values }
        setThread(updatedThread)

        return updateThreadFn({ ...values, thread_id: thread.thread_id })
            .then(() => {
                setIsEditing(false)
            })
            .catch(handleRequestError)
    }

    function onThreadDelete() {
        return deleteThreadFn({ thread_id: thread.thread_id })
            .then(() => {
                navigate("/threads")
            })
            .catch(handleRequestError)
    }

    return (
        <div>
            <div style={{ border: "1px solid" }}>
                {isEditing ? (
                    <div>
                        <ThreadForm
                            handleSubmit={(values) => onThreadUpdate(values)}
                            loading={updateLoading}
                            error={updateError}
                            initialTitle={thread.title}
                            initialDescription={editMessage}
                            initialThreadType={thread.thread_type}
                        />
                        <button onClick={onEditClick}>
                            {isEditing ? "Cancel Edit" : "Edit"}
                        </button>
                    </div>
                ) : (
                    <div>
                        <h1>{thread.title}</h1>
                        <p>{thread.description}</p>
                        <button onClick={onEditClick}>
                            {isEditing ? "Cancel Edit" : "Edit"}
                        </button>
                        <button onClick={onThreadDelete}>
                            {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                )}
                {deleteError ? <div>{deleteError}</div> : null}
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
