const pool = require("../db/db")

//All comics
async function getAllComics(req, res) {
	try {
		const query = `
            SELECT comic_id, title, description, cover_image_url, date, current_status, created_at FROM "comics";
        `
		const result = await pool.query(query)
		res.json(result.rows)
	} catch (error) {
		console.error("Error fetching comics:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

async function getComic(req, res) {
	try {
		const query = `
		SELECT comic_id, title, description, cover_image_url, date, current_status, created_at FROM "comics"
            WHERE comic_id = $1;
        `
		const result = await pool.query(query, [req.params.id])
		const comic = result.rows[0]
		res.json(comic)
	} catch (error) {
		console.error("Error fetching comic:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

async function getComments(req, res) {
	try {
		const query = `
            SELECT description, title FROM "comics"
            WHERE comic_id = $1;
        `
		const postResult = await pool.query(query, [req.params.id])
		const post = postResult.rows[0]

		const commentsQuery = `
            SELECT comment_id, messages, parent_id, createdAt FROM "comics_comment"
            WHERE comic_id = $1
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
	const { message } = req.body
	if (!message) {
		return res.status(400).json({ error: "Message is required" })
	}

	try {
		const comic_id = req.params.id
		const parent_id = req.params.parent_id
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
	getAllComics,
	getComic,
	getComments,
	createComment,
	updateComment,
	deleteComment,
	toggleLike,
}
