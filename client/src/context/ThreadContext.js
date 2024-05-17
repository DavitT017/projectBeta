import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { useParams } from "react-router-dom"
import { useAsync } from "../hooks/useAsync"
import { getAThread } from "../services/threads"

const ThreadContext = createContext(null)

export const handleRequestError = (error) => {
    return error?.response?.data?.message ?? "Error"
}

export function useThread() {
    return useContext(ThreadContext)
}

function ThreadContextProvider({ children }) {
    const { thread_id } = useParams()

    const {
        loading,
        error,
        value: thread,
    } = useAsync(() => getAThread(thread_id), [thread_id])

    const [comments, setComments] = useState([])

    const commentsByParentId = useMemo(() => {
        if (!comments) return []
        const group = {}

        comments.forEach((comment) => {
            group[comment?.parent_id] ||= []
            group[comment?.parent_id].push(comment)
        })

        return group
    }, [comments])

    useEffect(() => {
        if (thread?.comments == null) return
        setComments(thread?.comments)
    }, [thread?.comments])

    function getReplies(parent_id) {
        return commentsByParentId[parent_id]
    }

    function createLocalComment(comment) {
        setComments((prevComments) => [comment, ...prevComments])
    }

    function updateLocalComment(comment_id, message) {
        setComments((prevComments) => {
            const updatedComments = prevComments.map((comment) => {
                if (comment.comment_id === comment_id)
                    return { ...comment, messages: message }
                else return comment
            })
            return updatedComments
        })
    }

    function deleteLocalComment(comment_id) {
        setComments((prevComments) => {
            return prevComments.filter(
                (comment) => comment.comment_id !== comment_id
            )
        })
    }

    return (
        <ThreadContext.Provider
            value={{
                thread: { thread_id, ...thread },
                getReplies,
                createLocalComment,
                updateLocalComment,
                deleteLocalComment,
                rootComments: commentsByParentId[null],
            }}
        >
            {loading ? (
                <h1>Loading...</h1>
            ) : error ? (
                <h1>{error}</h1>
            ) : (
                children
            )}
        </ThreadContext.Provider>
    )
}

export default ThreadContextProvider
