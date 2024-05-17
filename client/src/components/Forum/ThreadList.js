import React, { useState, useEffect } from "react"
import { createThread, getThreads } from "../../services/threads"
import { NavLink, useNavigate } from "react-router-dom"
import { useAsyncFn } from "../../hooks/useAsync"
import Chat from "../../assets/Chat.png"
import Bug from "../../assets/Bug.png"
import Support from "../../assets/Support.png"
import Suggestion from "../../assets/Suggestion.png"
import ThreadForm from "./ThreadForm"
import { handleRequestError } from "../../context/ThreadContext"

export const ThreadList = () => {
    const navigate = useNavigate()

    const [page, setPage] = useState(1)
    const [threads, setThreads] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pageCount, setPageCount] = useState(0)

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                setLoading(true)
                const response = await getThreads(page)
                setThreads(response.threads)
                setPageCount(response.totalPages)
                setLoading(false)
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }
        fetchThreads()
    }, [page])

    const {
        loading: formLoading,
        error: formError,
        execute: createThreadFn,
    } = useAsyncFn(createThread)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>{error}</h1>
    if (!threads) return null

    function onThreadCreate({ title, description, thread_type }) {
        return createThreadFn({ title, description, thread_type })
            .then((response) => {
                navigate(`/threads/${response.thread_id}`)
            })
            .catch(handleRequestError)
    }

    const checkThreadType = (type) => {
        switch (type) {
            case "chat":
                return Chat
            case "bug":
                return Bug
            case "support":
                return Support
            case "suggestion":
                return Suggestion

            default:
                return Chat
        }
    }

    return (
        <React.Fragment>
            {threads.map((thread) => (
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
                        style={{
                            textDecoration: "none",
                            color: "white",
                        }}
                        to={`/threads/${thread.thread_id}`}
                    >
                        <img
                            style={{ width: "50px" }}
                            src={checkThreadType(thread.thread_type)}
                            alt="thread-icon"
                        />
                        <div>
                            <h1>{thread.title}</h1>
                            <p>{thread.comment_count} messages</p>
                        </div>
                    </NavLink>
                </div>
            ))}
            <div>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>{page}</span>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
                    disabled={page === pageCount}
                >
                    Next
                </button>
            </div>
            <ThreadForm
                loading={formLoading}
                error={formError}
                handleSubmit={onThreadCreate}
            />
        </React.Fragment>
    )
}
