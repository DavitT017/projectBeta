import React from "react"
import Comment from "./Comment"

function CommentsList({ comments }) {
    return comments.map((comment) => (
        <div key={comment?.comment_id}>
            <Comment {...comment} />
        </div>
    ))
}

export default CommentsList
