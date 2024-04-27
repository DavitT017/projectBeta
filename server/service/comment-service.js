const { Pool } = require("pg")
const pool = require("../db/db")

async function getComments(req, res) {
	try {
		const postQuery = `
        SELECT body, title FROM "post"
        WHERE id = $1;
      `
		const postResult = await pool.query(postQuery, [req.params.id])
		const post = postResult.rows[0]

		const commentsQuery = `
        SELECT id, message, parentId, createdAt FROM "comment"
        WHERE comic_Id = $1
        ORDER BY createdAt DESC;
      `
		const commentsResult = await pool.query(commentsQuery, [req.params.id])
		const comments = commentsResult.rows

		res.json({ post, comments })
	} catch (error) {
		console.error("Error fetching comments:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// Function to create a comment
async function createComment(req, res) {
	const { message, parentId } = req.body
	if (!message) {
		return res.status(400).json({ error: "Message is required" })
	}

	try {
		const postId = req.params.id
		const query = `
      INSERT INTO "comics_comment" ("messages", "user_id", "comic_id", "parent_id")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
		const values = [message, req.cookies.user_id, comic_id, parent_id]
		const result = await pool.query(query, values)
		const comment = result.rows[0]
		res.json(comment)
	} catch (error) {
		console.error("Error creating comment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// Function to update a comment
async function updateComment(req, res) {
	const { message } = req.body
	if (!message) {
		return res.status(400).json({ error: "Message is required" })
	}

	try {
		const { user_id } = await pool.query(
			'SELECT "user_id" FROM "comics_comment" WHERE comment_id = $1',
			[req.params.comment_id]
		)
		if (user_id !== req.cookies.user_id) {
			return res.status(401).json({
				error: "You do not have permission to edit this comment",
			})
		}

		const query = `
      UPDATE "comics_comment"
      SET "messages" = $1
      WHERE comment_id = $2
      RETURNING *;
    `
		const values = [message, req.params.comment_id]
		const result = await pool.query(query, values)
		const updatedComment = result.rows[0]
		res.json(updatedComment)
	} catch (error) {
		console.error("Error updating comment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// Function to delete a comment
async function deleteComment(req, res) {
	try {
		const { user_id } = await pool.query(
			'SELECT "user_id" FROM "comics_comment" WHERE comment_id = $1',
			[req.params.comment_id]
		)
		if (user_id !== req.cookies.user_id) {
			return res.status(401).json({
				error: "You do not have permission to delete this comment",
			})
		}

		await pool.query('DELETE FROM "comics_comment" WHERE comment_id = $1', [
			req.params.comment_id,
		])
		res.status(204).send()
	} catch (error) {
		console.error("Error deleting comment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// Function to toggle like for a comment
async function toggleLike(req, res) {
	try {
		const { comment_id } = req.params
		const user_id = req.cookies.user_id

		const existingLike = await pool.query(
			'SELECT * FROM "likes" WHERE "user_id" = $1 AND "comment_id" = $2',
			[user_id, comment_id]
		)
		if (existingLike.rows.length > 0) {
			await pool.query(
				'DELETE FROM "likes" WHERE "user_id" = $1 AND "comment_id" = $2',
				[user_id, comment_id]
			)
			res.json({ addLike: false })
		} else {
			await pool.query(
				'INSERT INTO "likes" ("user_id", "comment_id") VALUES ($1, $2)',
				[user_id, comment_id]
			)
			res.json({ addLike: true })
		}
	} catch (error) {
		console.error("Error toggling like:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

module.exports = {
	getComments,
	createComment,
	updateComment,
	deleteComment,
	toggleLike,
}