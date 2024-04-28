import React, { useState } from "react"
import CommentList from "./CommentList"
import CommentForm from "./CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import { useComics } from "../../context/ComicsContext"
import {
    createComment,
    deleteComment,
    toggleCommentLike,
    updateComment,
} from "../../services/comments"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

function Comments({ id, message, user, createdAt, likeCount, likedByMe }) {
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const {
        comics,
        getReplies,
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
        toggleLocalCommentLike,
    } = useComics()

    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const toggleCommentLikeFn = useAsyncFn(toggleCommentLike)
    const childComments = getReplies(id)

    function onCommentReply(message) {
        return createCommentFn
            .execute({ comic_id: comics.comic_id, message, parent_id: id })
            .then((comment) => {
                setIsReplying(false)
                createLocalComment(comment)
            })
    }

    function onCommentUpdate(message) {
        return updateCommentFn
            .execute({ comic_id: comics.comic_id, message, id })
            .then((comment) => {
                setIsEditing(false)
                updateLocalComment(id, comment.message)
            })
    }

    function onCommentDelete() {
        return deleteCommentFn
            .execute({ comic_id: comics.comic_id, id })
            .then((comment) => deleteLocalComment(comment.id))
    }

    function onToggleCommentLike() {
        return toggleCommentLikeFn
            .execute({ id, comic_id: comics.comic_id })
            .then(({ addLike }) => toggleLocalCommentLike(id, addLike))
    }

    return (
        <React.Fragment>
            <div>
                <div>
                    <span>{user.name}</span>
                    <span>{dateFormatter.format(Date.parse(createdAt))}</span>
                </div>
                {isEditing ? (
                    <CommentForm
                        initialValue={message}
                        onSubmit={onCommentUpdate}
                        loading={updateCommentFn.loading}
                        error={updateCommentFn.error}
                    />
                ) : (
                    <div>{message}</div>
                )}
                <div>
                    <button
                        onClick={onToggleCommentLike}
                        disabled={toggleCommentLikeFn.loading}
                        aria-label={likedByMe ? "Unlike" : "Like"}
                    >
                        Likes: {likeCount}
                    </button>
                    <button
                        onClick={() => setIsReplying((prev) => !prev)}
                        isActive={isReplying}
                        aria-label={isReplying ? "Cancel Reply" : "Reply"}
                    >
                        Reply
                    </button>
                    <React.Fragment>
                        <button
                            onClick={() => setIsEditing((prev) => !prev)}
                            isActive={isEditing}
                            aria-label={isEditing ? "Cancel Edit" : "Edit"}
                        >
                            Edit
                        </button>
                        <button
                            disabled={deleteCommentFn.loading}
                            onClick={onCommentDelete}
                            aria-label="Delete"
                            color="danger"
                        >
                            Delete
                        </button>
                    </React.Fragment>
                </div>
                {deleteCommentFn.error && <div>{deleteCommentFn.error}</div>}
            </div>
            {isReplying && (
                <div>
                    <CommentForm
                        autoFocus
                        onSubmit={onCommentReply}
                        loading={createCommentFn.loading}
                        error={createCommentFn.error}
                    />
                </div>
            )}
            {childComments?.length > 0 && (
                <React.Fragment>
                    <div>
                        <button
                            aria-label="Hide Replies"
                            onClick={() => setAreChildrenHidden(true)}
                        />
                        <div>
                            <CommentList comments={childComments} />
                        </div>
                    </div>
                    <button onClick={() => setAreChildrenHidden(false)}>
                        Show Replies
                    </button>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

export default Comments
