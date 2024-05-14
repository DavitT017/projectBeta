import React from "react"
import { getThreads } from "../../services/threads"
import { NavLink } from "react-router-dom"
import { useAsync } from "../../hooks/useAsync"

export const ThreadList = () => {
    const { loading, error, value: threads } = useAsync(getThreads)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>{error}</h1>
    if (!threads) return null

    return threads.map((thread) => (
        <div
            key={thread.thread_id}
            style={{
                width: "500px",
                border: "1px solid white",
                borderRadius: "10px",
                margin: "auto",
                marginBottom: "30px",
            }}
        >
            <NavLink
                style={{ textDecoration: "none", color: "white" }}
                to={`/threads/${thread.thread_id}`}
            >
                <h1>{thread.title}</h1>
                <p>{thread.comment_count} messages</p>
            </NavLink>
        </div>
    ))
}
