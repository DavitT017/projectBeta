import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
    createContext,
} from "react"
import { useParams } from "react-router-dom"
import { useAsync } from "../hooks/useAsync"
import { getAComics } from "../services/ComicsService"

const ComicsContext = createContext(null)

export function useComics() {
    return useContext(ComicsContext)
}

export function ComicsContextProvider({ children }) {
    const { comic_id } = useParams()
    const {
        loading,
        error,
        value: comics,
    } = useAsync(() => getAComics(comic_id), [comic_id])
    const [comments, setComments] = useState([])

    const commentsByParentId = useMemo(() => {
        const group = {}

        comments.forEach((comment) => {
            group[comment.parent_id] ||= []
            group[comment.parent_id].push(comment)
        })

        return group
    }, [comments])

    useEffect(() => {
        if (comics?.comments == null) return
        setComments(comics.comments)
    }, [comics?.comments])

    function getReplies(parent_id) {
        return commentsByParentId[parent_id]
    }

    function createLocalComment(comment) {
        setComments((prevComments) => {
            return [comment, ...prevComments]
        })
    }

    function updateLocalComment(id, message) {
        setComments((prevComments) => {
            return prevComments.map((comment) => {
                if (comment.id === id) {
                    return { ...comment, message }
                } else {
                    return comment
                }
            })
        })
    }

    function deleteLocalComment(id) {
        setComments((prevComments) => {
            return prevComments.filter((comment) => comment.id !== id)
        })
    }

    function toggleLocalCommentLike(id, addLike) {
        setComments((prevComments) => {
            return prevComments.map((comment) => {
                if (id === comment.id) {
                    if (addLike) {
                        return {
                            ...comment,
                            likeCount: comment.likeCount + 1,
                            likedByMe: true,
                        }
                    } else {
                        return {
                            ...comment,
                            likeCount: comment.likeCount - 1,
                            likedByMe: false,
                        }
                    }
                } else {
                    return comment
                }
            })
        })
    }

    return (
        <ComicsContext.Provider
            value={{
                comics: { comic_id, ...comics },
                rootComments: commentsByParentId[null],
                getReplies,
                createLocalComment,
                updateLocalComment,
                deleteLocalComment,
                toggleLocalCommentLike,
            }}
        >
            {loading ? <h1>Loading</h1> : error ? <h1>{error}</h1> : children}
        </ComicsContext.Provider>
    )
}
