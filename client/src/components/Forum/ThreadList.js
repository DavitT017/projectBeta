import React, { useMemo } from "react"
import { getThreads } from "../../services/threads"
// import { NavLink } from "react-router-dom"
import { useAsync } from "../../hooks/useAsync"
import { COLUMNS } from "./columns"
import { useTable } from "react-table"

export const ThreadList = () => {
    const { loading, error, value: threads } = useAsync(getThreads)
    console.log(threads)

    const columns = useMemo(() => COLUMNS, [])
    const data = useMemo(() => threads || [], [threads])

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data })

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>{error}</h1>
    if (!threads) return null

    // return threads.map((thread) => (
    //     <h1 key={thread.thread_id}>
    //         <NavLink
    //             style={{ textDecoration: "none", color: "blue" }}
    //             to={`/threads/${thread.thread_id}`}
    //         >
    //             {thread.title}
    //         </NavLink>
    //     </h1>
    // ))

    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                            <th {...column.getHeaderProps()}>
                                {column.render("Header")}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => (
                                <td {...cell.getCellProps()}>
                                    {cell.render("Cell")}
                                </td>
                            ))}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
