import React from "react"
import Comments from "./Comments"

function CommentList({ comments }) {
    return comments.map((comment) => (
        <div key={comment.id}>
            <Comments {...comment} />
        </div>
    ))
}

export default CommentList
