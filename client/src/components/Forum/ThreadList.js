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
        <h1 key={thread.thread_id}>
            <NavLink
                style={{ textDecoration: "none", color: "blue" }}
                to={`/threads/${thread.thread_id}`}
            >
                {thread.title}
            </NavLink>
        </h1>
    ))
}
