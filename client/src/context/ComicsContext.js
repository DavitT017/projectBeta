import React, {
    useContext,
    createContext,
    useMemo,
    useState,
    useEffect,
} from "react"
import { useAsync } from "../hooks/useAsync"
import { getAComics } from "../services/comics"
import { useParams } from "react-router-dom"

const ComicsContext = createContext(null)

export const handleRequestError = (error) => {
    return error?.response?.data?.message ?? "Error"
}

export function useComics() {
    return useContext(ComicsContext)
}

function ComicsContextProvider({ children }) {
    const { comic_id } = useParams()

    const {
        loading,
        error,
        value: comic,
    } = useAsync(() => getAComics(comic_id), [comic_id])

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
        if (comic?.comments == null) return
        setComments(comic?.comments)
    }, [comic?.comments])

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
        <ComicsContext.Provider
            value={{
                comic: { comic_id, ...comic },
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
        </ComicsContext.Provider>
    )
}

export default ComicsContextProvider
