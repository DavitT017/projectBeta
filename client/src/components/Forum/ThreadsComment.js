import React, { useState } from "react"
import { useThread, handleRequestError } from "../../context/ThreadContext"
import CommentsList from "./ThreadCommentsList"
import CommentForm from "../Comments/CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import {
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    unlikeComment,
} from "../../services/threadComments"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

function Comment({
    comment_id,
    user,
    messages,
    createdat,
    like_count,
    liked_by_me,
}) {
    const {
        thread,
        getReplies,
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
    } = useThread()

    const childComments = getReplies(comment_id)

    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [likedByMe, setLikedByMe] = useState(liked_by_me)
    const [likeCount, setLikeCount] = useState(like_count)
    const [editMessage, setEditMessage] = useState(messages)

    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const likeCommentFn = useAsyncFn(likeComment)
    const unlikeCommentFn = useAsyncFn(unlikeComment)

    const onCommentReply = (message, parent_id) => {
        return createCommentFn
            .execute({
                thread_id: thread?.thread_id,
                message,
                parent_id,
            })
            .then((comment) => {
                setIsReplying(false)
                createLocalComment(comment)
            })
            .catch(handleRequestError)
    }

    const onCommentUpdate = (message) => {
        return updateCommentFn
            .execute({
                thread_id: thread?.thread_id,
                message,
                comment_id,
            })
            .then((comment) => {
                setIsEditing(false)
                setEditMessage("")
                updateLocalComment(comment_id, comment.messages)
            })
            .catch(handleRequestError)
    }

    const onEditClick = () => {
        if (isEditing) {
            setEditMessage(editMessage)
        } else {
            setEditMessage(messages)
        }
        setIsEditing(!isEditing)
    }

    const onCommentDelete = () => {
        return deleteCommentFn
            .execute({
                thread_id: thread?.thread_id,
                comment_id,
            })
            .then(() => deleteLocalComment(comment_id))
            .catch(handleRequestError)
    }

    const onLikeComment = () => {
        return likeCommentFn
            .execute({
                thread_id: thread?.thread_id,
                comment_id,
            })
            .then((response) => {
                if (!response.error) {
                    setLikedByMe(true)
                    setLikeCount((prevLikeCount) => prevLikeCount + 1)
                }
            })
            .catch(handleRequestError)
    }

    const onUnlikeComment = () => {
        return unlikeCommentFn
            .execute({
                thread_id: thread?.thread_id,
                comment_id,
            })
            .then((response) => {
                if (!response.error) {
                    setLikedByMe(false)
                    setLikeCount((prevLikeCount) => prevLikeCount - 1)
                }
            })
            .catch(handleRequestError)
    }

    return (
        <React.Fragment>
            <div
                style={{
                    border: "1px solid gray",
                    borderRadius: "10px",
                    width: "500px",
                    margin: "auto",
                    padding: "10px",
                    marginTop: "30px",
                }}
            >
                <div>
                    <span>{user?.username} | </span>
                    <span>{dateFormatter.format(Date.parse(createdat))}</span>
                    <hr />
                </div>
                {isEditing ? (
                    <CommentForm
                        autoFocus
                        handleSubmit={(message) => onCommentUpdate(message)}
                        initialMessage={editMessage}
                        loading={updateCommentFn.loading}
                        error={updateCommentFn.error}
                    />
                ) : (
                    <div style={{ padding: "10px" }}>{messages}</div>
                )}
                <div>
                    {likedByMe ? (
                        <button onClick={onUnlikeComment}>Unlike</button>
                    ) : (
                        <button onClick={onLikeComment}>Like</button>
                    )}
                    <p>{likeCount}</p>
                    {likeCommentFn.error ? (
                        <div>{likeCommentFn.error}</div>
                    ) : null}
                    {unlikeCommentFn.error ? (
                        <div>{unlikeCommentFn.error}</div>
                    ) : null}
                    <button
                        onClick={() => setIsReplying((prevState) => !prevState)}
                    >
                        {isReplying ? "Cancel Reply" : "Reply"}
                    </button>
                    <button onClick={() => onEditClick()}>
                        {isEditing ? "Cancel Edit" : "Edit"}
                    </button>
                    <button
                        disabled={deleteCommentFn.loading}
                        onClick={() => onCommentDelete()}
                    >
                        {deleteCommentFn.loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
                {deleteCommentFn.error ? (
                    <div>{deleteCommentFn.error}</div>
                ) : null}
            </div>
            {isReplying ? (
                <div>
                    <CommentForm
                        autoFocus
                        loading={createCommentFn.loading}
                        error={createCommentFn.error}
                        handleSubmit={(message) =>
                            onCommentReply(message, comment_id)
                        }
                    />
                </div>
            ) : null}
            {childComments && childComments?.length > 0 ? (
                <React.Fragment>
                    <div
                        className={`nested-comments-stack ${
                            areChildrenHidden ? "hide" : ""
                        }`}
                    >
                        <button
                            className="collapse-line"
                            onClick={() => setAreChildrenHidden(true)}
                        />
                        <div className="nested-comments">
                            <CommentsList comments={childComments} />
                        </div>
                    </div>
                    <button
                        className={`btn ${!areChildrenHidden ? "hide" : ""}`}
                        onClick={() => setAreChildrenHidden(false)}
                    >
                        Show Replies
                    </button>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    )
}

export default Comment
