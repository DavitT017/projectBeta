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
            WHERE c.comic_id = $1
            ORDER BY createdat DESC;
        `
        const commentsResult = await pool.query(commentsQuery, [
            req.params.comic_id,
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
            WHERE l.user_id = $2
            AND l.comment_id = $1;
            `
            const likeResult = await pool.query(likeQuery, [comment.comment_id, req.cookies.userId])
            comment.liked_by_me = likeResult.rows.length > 0
        }

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
            INSERT INTO "comics_comment" ("messages", "user_id", "comic_id", "parent_id","parent_type", "like_count")
            VALUES ($1, $2, $3, $4,'comic', $5)
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

async function likeComment(req, res) {
    try {
        const { comment_id } = req.params
        const { userId } = req.cookies

        // Check if the user has already liked the comment
        const existingLike = await pool.query(
            'SELECT 1 FROM "likes" WHERE comment_id = $1 AND user_id = $2',
            [comment_id, userId]
        )

        if (existingLike.rows.length > 0) {
            return res
                .status(400)
                .json({ error: "You have already liked this comment" })
        }

        // Insert a new like
        await pool.query(
            'INSERT INTO "likes" (user_id, comment_id) VALUES ($1, $2)',
            [userId, comment_id]
        )
        // Update like_count in comments table
        await updateLikeCount(comment_id)

        res.status(200).send()
    } catch (error) {
        console.error("Error liking comment:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

async function unlikeComment(req, res) {
    try {
        const { comment_id } = req.params
        const { userId } = req.cookies

        // Check if the user has liked the comment
        const existingLike = await pool.query(
            'SELECT 1 FROM "likes" WHERE comment_id = $1 AND user_id = $2',
            [comment_id, userId]
        )

        if (existingLike.rows.length === 0) {
            return res
                .status(400)
                .json({ error: "You have not liked this comment" })
        }

        // Remove the like
        await pool.query(
            'DELETE FROM "likes" WHERE comment_id = $1 AND user_id = $2',
            [comment_id, userId]
        )
        // Update like_count in comments table
        await updateLikeCount(comment_id)

        res.status(200).send()
    } catch (error) {
        console.error("Error unliking comment:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

async function updateLikeCount(comment_id) {
    const likeCountResult = await pool.query(
        'SELECT COUNT(*) FROM "likes" WHERE comment_id = $1',
        [comment_id]
    )
    const likeCount = parseInt(likeCountResult.rows[0].count)

    await pool.query(
        'UPDATE "comics_comment" SET like_count = $1 WHERE comment_id = $2',
        [likeCount, comment_id]
    )
}

// Function to create a thread
async function createThread(req, res) {
    const { title, description } = req.body

    if (!title || !description) {
        return res.status(400).send({ error: "Title and description are required" })
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
    const { message, parent_id } = req.body;

    if (!message) {
        return res.status(400).send({ error: "Message is required" });
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

        const newComment = result.rows[0];

        res.json(newComment);
    } catch (error) {
        console.error("Error creating thread comment:", error);
        res.status(500).send({ error: "Internal server error" });
    }
}


// Function to get all threads with comments
async function getAllThreadsWithComments(req, res) {
    try {
        const query = `
            SELECT 
                t.thread_id,
                t.title,
                t.description,
                t.user_id,
                t.created_at,
                COUNT(c.comment_id) AS comment_count
            FROM 
                "threads" t
            LEFT JOIN 
                "comics_comment" c ON t.thread_id = c.parent_id AND c.parent_type = 'thread'
            GROUP BY 
                t.thread_id, t.title, t.description, t.user_id, t.created_at;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).send({ error: "Internal server error" });
    }
}

// Function to get a thread by ID with comments
async function getThreadWithComments(req, res) {
    try {
        const query = `
            SELECT 
                t.thread_id,
                t.title,
                t.description,
                t.user_id,
                t.created_at,
                COUNT(c.comment_id) AS comment_count
            FROM 
                "threads" t
            LEFT JOIN 
                "comics_comment" c ON t.thread_id = c.parent_id AND c.parent_type = 'thread'
            WHERE 
                t.thread_id = $1
            GROUP BY 
                t.thread_id, t.title, t.description, t.user_id, t.created_at;
        `;
        const result = await pool.query(query, [req.params.thread_id]);
        const thread = result.rows[0];

        if (!thread) {
            return res.status(404).send({ error: "Thread not found" });
        }

        res.json(thread);
    } catch (error) {
        console.error("Error fetching thread:", error);
        res.status(500).send({ error: "Internal server error" });
    }
}


// Function to update a thread
async function updateThread(req, res) {
    const { title, description } = req.body
    if (!title || !description) {
        return res.status(400).send({ error: "Title and description are required" })
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
        await pool.query('DELETE FROM "threads" WHERE thread_id = $1', [req.params.thread_id])
        // Also delete comments associated with the thread
        await pool.query('DELETE FROM "comics_comment" WHERE parent_id = $1 AND parent_type = $2', [req.params.thread_id, 'thread'])
        res.status(204).send()
        console.log("Thread Deleted")
    } catch (error) {
        console.error("Error deleting thread:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}


module.exports = {
    getAllComics,
    getComic,
    createComment,
    updateComment,
    deleteComment,
    unlikeComment,
    likeComment,
    createThread,
    createThreadComment,
    getAllThreadsWithComments,
    getThreadWithComments,
    updateThread,
    deleteThread
}
