const pool = require("../db/db")
const Filter = require("bad-words")

const filter = new Filter()
const words = require("../middlewares/extra-words.json")
filter.addWords(...words)

// Function to create a thread
async function createThread(req, res) {
	const { title, description } = req.body
	if (!title || !description) {
		return res
			.status(400)
			.send({ error: "Title and description are required" })
	}

	if (filter.isProfane(title || description)) {
		return res
			.status(400)
			.send({ error: "Thread contains inappropriate language." })
	}

	try {
		const query = `
            INSERT INTO "threads" ("title", "description", "user_id")
            VALUES ($1, $2, $3)
            RETURNING *;
        `
		const values = [title, description, req.cookies.userId]
		const result = await pool.query(query, values)

		const newThread = result.rows[0]

		res.json(newThread)
	} catch (error) {
		console.error("Error creating thread:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

// Function to create a comment on a thread
async function createThreadComment(req, res) {
	const { message, parent_id } = req.body

	if (!message) {
		return res.status(400).send({ error: "Message is required" })
	}
	if (filter.isProfane(message)) {
		return res
			.status(400)
			.send({ error: "Message contains inappropriate language." })
	}

	try {
		const thread_id = req.params.thread_id
		const query = `
            INSERT INTO "comics_comment" ("messages", "user_id", "parent_id","parent_type", "like_count", "thread_id")
            VALUES ($1, $2, $3,'thread', $4, $5)
            RETURNING *;
        `
		const values = [message, req.cookies.userId, parent_id, 0, thread_id]
		const result = await pool.query(query, values)

		const newComment = result.rows[0]

		// Populate the user object in the new comment
		const userQuery = `
            SELECT user_id, username, avatar_url FROM "users" WHERE user_id = $1;
        `
		const userResult = await pool.query(userQuery, [req.cookies.userId])
		const user = userResult.rows[0]
		newComment.user = user

		await updateThreadCommentCount(thread_id)

		res.json(newComment)
	} catch (error) {
		console.error("Error creating thread comment:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

// Function to update the comment_count for a thread
async function updateThreadCommentCount(thread_id) {
	const commentCountResult = await pool.query(
		'SELECT COUNT(*) FROM "comics_comment" WHERE thread_id = $1 AND parent_type = $2',
		[thread_id, "thread"]
	)
	const commentCount = parseInt(commentCountResult.rows[0].count)

	await pool.query(
		'UPDATE "threads" SET comment_count = $1 WHERE thread_id = $2',
		[commentCount, thread_id]
	)
}

// Function to get all threads with comments
async function getAllThreadsWithComments(req, res) {
	try {
		const query = `
            SELECT thread_id, title, description, user_id, created_at, comment_count FROM "threads";
        `
		const result = await pool.query(query)
		const threads = result.rows

		for (let thread of threads) {
			const commentsQuery = `
                SELECT  c.comment_id, c.messages, c.parent_id, c.user_id, c.createdat FROM "comics_comment" c 
                WHERE  c.thread_id = $1 AND c.parent_type = 'thread'
                ORDER BY c.createdat DESC;
            `
			const commentsResult = await pool.query(commentsQuery, [
				thread.thread_id,
			])
			const comments = commentsResult.rows

			for (let comment of comments) {
				const likeCountResult = await pool.query(
					'SELECT COUNT(*) FROM "likes" WHERE comment_id = $1',
					[comment.comment_id]
				)
				comment.like_count = parseInt(likeCountResult.rows[0].count)

				// Check if the current user has liked this comment
				const likeQuery = `
                    SELECT c.user_id, l.comment_id FROM likes l
                    INNER JOIN 
                        comics_comment c ON l.comment_id = c.comment_id
                    WHERE  l.user_id = $2 AND l.comment_id = $1;
                `
				const likeResult = await pool.query(likeQuery, [
					comment.comment_id,
					req.cookies.userId,
				])
				comment.liked_by_me = likeResult.rows.length > 0
			}

			thread.comments = comments
		}

		res.json(threads)
	} catch (error) {
		console.error("Error fetching threads:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

// Function to get a thread by ID with comments
async function getThreadWithComments(req, res) {
	try {
		const threadQuery = `
            SELECT thread_id, title, description, user_id, created_at, comment_count
            FROM "threads"
            WHERE thread_id = $1;
        `
		const threadResult = await pool.query(threadQuery, [
			req.params.thread_id,
		])
		const thread = threadResult.rows[0]

		if (!thread) {
			return res.status(404).send({ error: "Thread not found" })
		}

		const commentsQuery = `
            SELECT c.comment_id, c.messages, c.parent_id, c.user_id, c.createdat, c.like_count
            FROM "comics_comment" c
            WHERE c.thread_id = $1 AND c.parent_type = 'thread'
            ORDER BY c.like_count DESC;
        `
		const commentsResult = await pool.query(commentsQuery, [
			req.params.thread_id,
		])
		const comments = commentsResult.rows

		for (let comment of comments) {
			const userQuery = `
                SELECT user_id, username, avatar_url
                FROM "users"
                WHERE user_id = $1;
            `
			const userResult = await pool.query(userQuery, [comment.user_id])
			const user = userResult.rows[0]
			comment.user = user

			const likeCountResult = await pool.query(
				'SELECT COUNT(*) FROM "likes" WHERE comment_id = $1',
				[comment.comment_id]
			)
			comment.like_count = parseInt(likeCountResult.rows[0].count)

			// Check if the current user has liked this comment
			const likeQuery = `
                SELECT c.user_id, l.comment_id
                FROM likes l
                INNER JOIN comics_comment c ON l.comment_id = c.comment_id
                WHERE l.user_id = $2 AND l.comment_id = $1;
            `
			const likeResult = await pool.query(likeQuery, [
				comment.comment_id,
				req.cookies.userId,
			])
			comment.liked_by_me = likeResult.rows.length > 0
		}

		thread.comments = comments

		res.json(thread)
	} catch (error) {
		console.error("Error fetching thread:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

// Function to update a thread
async function updateThread(req, res) {
	const { title, description } = req.body
	if (!title || !description) {
		return res
			.status(400)
			.send({ error: "Title and description are required" })
	}

    if (filter.isProfane(title || description)) {
        return res.status(400).send ({error: "Thread contains inappropriate language."})
    }

	try {
		const query = `
            UPDATE "threads"
            SET "title" = $1, "description" = $2
            WHERE thread_id = $3
            RETURNING *;
        `
		const values = [title, description, req.params.thread_id]
		const result = await pool.query(query, values)
		const updatedThread = result.rows[0]
		res.json(updatedThread)
	} catch (error) {
		console.error("Error updating thread:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

// Function to delete a thread
async function deleteThread(req, res) {
	try {
		await pool.query('DELETE FROM "threads" WHERE thread_id = $1', [
			req.params.thread_id,
		])
		// Also delete comments associated with the thread
		await pool.query(
			'DELETE FROM "comics_comment" WHERE parent_id = $1 AND parent_type = $2',
			[req.params.thread_id, "thread"]
		)
		res.status(204).send()
		console.log("Thread Deleted")
	} catch (error) {
		console.error("Error deleting thread:", error)
		res.status(500).send({ error: "Internal server error" })
	}
}

module.exports = {
	createThread,
	createThreadComment,
	getAllThreadsWithComments,
	getThreadWithComments,
	updateThread,
	deleteThread,
	updateThreadCommentCount,
}
