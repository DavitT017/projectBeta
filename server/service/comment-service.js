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
        res.status(500).send({ error: "Internal server error" })
    }
}

async function getComic(req, res) {
    try {
        const comicQuery = `
            SELECT comic_id, title, description, cover_image_url, date, current_status, created_at
            FROM "comics"
            WHERE comic_id = $1;
        `
        const comicResult = await pool.query(comicQuery, [req.params.comic_id])
        const comic = comicResult.rows[0]

        const commentsQuery = `
            SELECT c.comment_id, c.messages, c.parent_id, c.user_id, c.createdat
            FROM "comics_comment" c
            WHERE c.comic_id = $1;
        `
        const commentsResult = await pool.query(commentsQuery, [
            req.params.comic_id,
        ])
        const comments = commentsResult.rows

        // Fetch user details for each comment
        for (let comment of comments) {
            const userQuery = `
                SELECT user_id, username, avatar_url
                FROM "users"
                WHERE user_id = $1;
            `
            const userResult = await pool.query(userQuery, [comment.user_id])
            const user = userResult.rows[0]
            comment.user = user

            // Calculate likeCount and likedByMe for each comment
            const likeCountResult = await pool.query(
                'SELECT COUNT(*) FROM "likes" WHERE comment_id = $1',
                [comment.comment_id]
            )
            comment.likeCount = parseInt(likeCountResult.rows[0].count)

            const likedByMeResult = await pool.query(
                'SELECT 1 FROM "likes" WHERE comment_id = $1 AND user_id = $2',
                [comment.comment_id, req.cookies.user_id]
            )
            comment.likedByMe = likedByMeResult.rows.length > 0
        }

        // Add comments array to comic object
        comic.comments = comments

        res.json(comic)
    } catch (error) {
        console.error("Error fetching comic:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

// Function to create a comment
async function createComment(req, res) {
    const { message, parent_id } = req.body

    if (!message) {
        return res.status(400).send({ error: "Message is required" })
    }

    try {
        const comic_id = req.params.comic_id
        const query = `
            INSERT INTO "comics_comment" ("messages", "user_id", "comic_id", "parent_id", "like_count")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `
        const values = [message, req.cookies.userId, comic_id, parent_id, 0]
        const result = await pool.query(query, values)

        const newComment = result.rows[0]

        // Fetch user details for the new comment
        const userQuery = `
            SELECT user_id, username, avatar_url
            FROM "users"
            WHERE user_id = $1;
        `
        const userResult = await pool.query(userQuery, [newComment.user_id])
        const user = userResult.rows[0]

        newComment.user = user

        res.json(newComment)
    } catch (error) {
        console.error("Error creating comment:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

// Function to update a comment
async function updateComment(req, res) {
    const { message } = req.body
    if (!message) {
        return res.status(400).send({ error: "Message is required" })
    }

    try {
        const { user_id } = await pool.query(
            'SELECT "user_id" FROM "comics_comment" WHERE comment_id = $1',
            [req.params.comment_id]
        )
        if (user_id !== req.cookies.user_id) {
            return res.status(401).send({
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
        res.status(500).send({ error: "Internal server error" })
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
            return res.status(401).send({
                error: "You do not have permission to delete this comment",
            })
        }

        await pool.query('DELETE FROM "comics_comment" WHERE comment_id = $1', [
            req.params.comment_id,
        ])
        res.status(204).send()
    } catch (error) {
        console.error("Error deleting comment:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

module.exports = {
    getAllComics,
    getComic,
    createComment,
    updateComment,
    deleteComment,
}
