import { useCallback, useEffect, useState } from "react"

export function useAsync(func) {
    const { execute, ...state } = useAsyncInternal(func, true)

    useEffect(() => {
        execute()
    }, [execute])

    return state
}

export function useAsyncFn(func) {
    return useAsyncInternal(func, false)
}

function useAsyncInternal(func, initialLoading = false) {
    const [loading, setLoading] = useState(initialLoading)
    const [error, setError] = useState()
    const [value, setValue] = useState()

    const execute = useCallback(
        (...params) => {
            setLoading(true)
            return func(...params)
                .then((data) => {
                    setValue(data)
                    setError(undefined)
                    return data
                })
                .catch((error) => {
                    setError(error)
                    setValue(undefined)
                    return Promise.reject(error)
                })
                .finally(() => {
                    setLoading(false)
                })
        },
        [func]
    )

    return { loading, error, value, execute }
}
