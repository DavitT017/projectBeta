import React, { useState } from "react"
import { useComics } from "../../context/ComicsContext"
import CommentsList from "./CommentsList"
import CommentForm from "./CommentForm"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/comments"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
})

function Comment({ comment_id, user, messages, createdat }) {
    const { comic, getReplies, createLocalComment } = useComics()

    const childComments = getReplies(comment_id)
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)

    const createCommentFn = useAsyncFn(createComment)

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
                <div style={{ padding: "10px" }}>{messages}</div>
                <div>
                    <button>Likes: 0</button>
                    <button
                        onClick={() => setIsReplying((prevState) => !prevState)}
                    >
                        {isReplying ? "Cancel Reply" : "Reply"}
                    </button>
                    <button>Edit</button>
                    <button>Delete</button>
                </div>
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
                            aria-label="Hide Replies" // need to go over again
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
