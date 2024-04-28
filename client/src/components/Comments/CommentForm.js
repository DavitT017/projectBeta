import React, { useState } from "react"

function CommentForm({ loading, error, onSubmit, initialValue = "" }) {
    const [message, setMessage] = useState(initialValue)

    function handleSubmit(e) {
        e.preventDefault()
        onSubmit(message).then(() => setMessage(""))
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Loading" : "Post"}
                </button>
            </div>
            <div>{error}</div>
        </form>
    )
}

export default CommentForm
