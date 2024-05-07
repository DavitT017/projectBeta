import React, { useState } from "react"
import { useComics } from "../../context/ComicsContext"
import CommentsList from "./CommentsList"
import CommentForm from "./CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import {
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    unlikeComment,
} from "../../services/comments"

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
        comic,
        getReplies,
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
    } = useComics()

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
                comic_id: comic?.comic_id,
                message,
                parent_id,
            })
            .then((comment) => {
                setIsReplying(false)
                createLocalComment(comment)
            })
    }

    const onCommentUpdate = (message) => {
        return updateCommentFn
            .execute({
                comic_id: comic?.comic_id,
                message,
                comment_id,
            })
            .then((comment) => {
                setIsEditing(false)
                setEditMessage("")
                updateLocalComment(comment_id, comment.messages)
            })
    }

    const onEditClick = () => {
        setEditMessage(messages)
        setIsEditing(true)
    }

    const onCommentDelete = () => {
        return deleteCommentFn
            .execute({
                comic_id: comic?.comic_id,
                comment_id,
            })
            .then(() => deleteLocalComment(comment_id))
    }

    const onLikeComment = () => {
        return likeCommentFn
            .execute({
                comic_id: comic?.comic_id,
                comment_id,
            })
            .then((response) => {
                if (response.error) {
                    console.log(response.error)
                } else {
                    setLikedByMe(true)
                    setLikeCount((prevLikeCount) => prevLikeCount + 1)
                }
            })
    }

    const onUnlikeComment = () => {
        return unlikeCommentFn
            .execute({
                comic_id: comic?.comic_id,
                comment_id,
            })
            .then((response) => {
                if (response.error) {
                    console.log(response.error)
                } else {
                    setLikedByMe(false)
                    setLikeCount((prevLikeCount) => prevLikeCount - 1)
                }
            })
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
                    <button
                        onClick={() => setIsReplying((prevState) => !prevState)}
                    >
                        {isReplying ? "Cancel Reply" : "Reply"}
                    </button>
                    <button
                        onClick={() => setIsEditing((prevState) => !prevState)}
                    >
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
                        initialMessage={editMessage}
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
