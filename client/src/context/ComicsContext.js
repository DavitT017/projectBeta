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
        if (!comic?.comments) return
        setComments(comic?.comments)
    }, [comic?.comments])

    function getReplies(parent_id) {
        return commentsByParentId[parent_id]
    }

    function createLocalComment(comment) {
        setComments((prevComments) => [comment, ...prevComments])
    }

    return (
        <ComicsContext.Provider
            value={{
                comic: { comic_id, ...comic },
                getReplies,
                createLocalComment,
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
