import React from "react"
import { createThread, getThreads } from "../../services/threads"
import { NavLink, useNavigate } from "react-router-dom"
import { useAsync, useAsyncFn } from "../../hooks/useAsync"
import Chat from "../../assets/Chat.png"
import Bug from "../../assets/Bug.png"
import Support from "../../assets/Support.png"
import Suggestion from "../../assets/Suggestion.png"
import ThreadForm from "./ThreadForm"
import { handleRequestError } from "../../context/ThreadContext"

export const ThreadList = () => {
    const navigate = useNavigate()

    const { loading, error, value: threads } = useAsync(getThreads)

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
                return null
        }
    }

    return (
        <React.Fragment>
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
            </React.Fragment>
            <ThreadForm
                loading={formLoading}
                error={formError}
                handleSubmit={onThreadCreate}
            />
        </React.Fragment>
    )
}
