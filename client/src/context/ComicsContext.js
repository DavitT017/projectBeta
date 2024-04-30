import React, { useContext, createContext, useMemo } from "react"
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

    const commentsByParentId = useMemo(() => {
        if (!comic?.comments) return []
        const group = {}

        comic?.comments.forEach((comment) => {
            group[comment?.parent_id] ||= []
            group[comment?.parent_id].push(comment)
        })

        return group
    }, [comic?.comments])

    function getReplies(parent_id) {
        return commentsByParentId[parent_id]
    }

    return (
        <ComicsContext.Provider
            value={{
                comic: { comic_id, ...comic },
                getReplies,
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
