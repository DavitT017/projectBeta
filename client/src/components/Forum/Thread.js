import React, { useState } from "react"
import { handleRequestError, useThread } from "../../context/ThreadContext"
import { useAsyncFn } from "../../hooks/useAsync"
import { createComment } from "../../services/threadComments"
import { deleteThread, updateThread } from "../../services/threads"
import CommentForm from "../Comments/CommentForm"
import CommentsList from "./ThreadCommentsList"

function Thread() {
	const {
		thread,
		rootComments,
		createLocalComment,
		deleteLocalThread,
		updateLocalThread,
	} = useThread()
	const {
		loading: updateLoading,
		error: updateError,
		execute: updateThreadFn,
	} = useAsyncFn(updateThread)
	const {
		loading: deleteLoading,
		error: deleteError,
		execute: deleteThreadFn,
	} = useAsyncFn(deleteThread)

	const [isEditing, setIsEditing] = useState(false)

	const {
		loading,
		error,
		execute: createCommentFn,
	} = useAsyncFn(createComment)

	function onCommentCreate(message) {
		return createCommentFn({ thread_id: thread.thread_id, message })
			.then(createLocalComment)
			.catch(handleRequestError)
	}

	function onThreadUpdate(values) {
		return updateThreadFn({ ...values, thread_id: thread.thread_id })
			.then((updatedThread) => {
				updateLocalThread(updatedThread)
				setIsEditing(false)
			})
			.catch(handleRequestError)
	}

	function onThreadDelete() {
		return deleteThreadFn({ thread_id: thread.thread_id })
			.then(() => deleteLocalThread(thread.thread_id))
			.catch(handleRequestError)
	}

	return (
		<div>
			<div style={{ border: "1px solid" }}>
				<h1>{thread.title}</h1>
				<p>{thread.description}</p>
				<button>Edit</button>
			</div>
			<div>
				<h3>Comments</h3>
				<div>
					<CommentForm
						loading={loading}
						error={error}
						handleSubmit={onCommentCreate}
					/>
					{rootComments && rootComments.length > 0 ? (
						<div>
							<CommentsList comments={rootComments} />
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default Thread
