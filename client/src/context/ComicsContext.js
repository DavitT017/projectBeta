import React, { useContext, createContext } from "react"
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

    return (
        <ComicsContext.Provider value={{ comic: { comic_id, ...comic } }}>
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
