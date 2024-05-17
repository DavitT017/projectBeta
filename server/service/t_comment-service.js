const pool = require("../db/db")
const Filter = require("bad-words")

const filter = new Filter()
const words = require("../middlewares/extra-words.json")
filter.addWords(...words)

// Function to create a thread
async function createThread(req, res) {
    const { title, description, thread_type } = req.body
    
    if (!title || !description || !thread_type) {
        return res
            .status(400)
            .send({ message: "Thread form fields are required" })
    }

    if (filter.isProfane(title) || filter.isProfane(description)) {
        return res
            .status(400)
            .send({ message: "Thread contains inappropriate language." })
    }

    try {
        const query = `
            INSERT INTO "threads" ("title", "description", "user_id", "thread_type", "created_at")
            VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC')
            RETURNING *;
        `
        const values = [title, description, req.cookies.userId, thread_type]
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
            .send({ message: "Message contains inappropriate language." })
    }

    try {
        const thread_id = req.params.thread_id
        const query = `
            INSERT INTO "comics_comment" ("messages", "user_id", "parent_id","parent_type", "like_count", "thread_id", "created_at")
            VALUES ($1, $2, $3,'thread', $4, $5, NOW() AT TIME ZONE 'UTC')
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
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const offset = (page - 1) * limit;

    try {
        // Fetch total count of threads for pagination
        const countQuery = 'SELECT COUNT(*) FROM "threads"';
        const countResult = await pool.query(countQuery);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);

        // Fetch the paginated threads
        const query = `
            SELECT thread_id, title, description, user_id, created_at, comment_count, thread_type 
            FROM "threads" 
            ORDER BY comment_count DESC 
            LIMIT $1 OFFSET $2;
        `;
        const values = [limit, offset];
        const result = await pool.query(query, values);
        const threads = result.rows;

        for (let thread of threads) {
            const commentsQuery = `
                SELECT c.comment_id, c.messages, c.parent_id, c.user_id, c.created_at 
                FROM "comics_comment" c 
                WHERE c.thread_id = $1 AND c.parent_type = 'thread'
                ORDER BY c.created_at DESC;
            `;
            const commentsResult = await pool.query(commentsQuery, [thread.thread_id]);
            const comments = commentsResult.rows;

            for (let comment of comments) {
                const likeCountResult = await pool.query(
                    'SELECT COUNT(*) FROM "likes" WHERE comment_id = $1',
                    [comment.comment_id]
                );
                comment.like_count = parseInt(likeCountResult.rows[0].count);

                // Check if the current user has liked this comment
                const likeQuery = `
                    SELECT c.user_id, l.comment_id FROM likes l
                    INNER JOIN comics_comment c ON l.comment_id = c.comment_id
                    WHERE l.user_id = $2 AND l.comment_id = $1;
                `;
                const likeResult = await pool.query(likeQuery, [comment.comment_id, req.cookies.userId]);
                comment.liked_by_me = likeResult.rows.length > 0;
            }

            thread.comments = comments;
        }

        res.json({
            threads,
            totalCount,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).send({ error: "Internal server error" });
    }
}

// Function to get a thread by ID with comments
async function getThreadWithComments(req, res) {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided
    const offset = (page - 1) * limit;

    try {
        const threadQuery = `
            SELECT thread_id, title, description, user_id, created_at, comment_count, thread_type
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

        // Fetch total count of comments for pagination
        const countQuery = 'SELECT COUNT(*) FROM "comics_comment" WHERE thread_id = $1 AND parent_type = $2 AND parent_id IS NULL';
        const countResult = await pool.query(countQuery, [req.params.thread_id, "thread"]);
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);

        const commentsQuery = `
            SELECT c.comment_id, c.messages, c.parent_id, c.user_id, c.created_at, c.like_count
            FROM "comics_comment" c
            WHERE c.thread_id = $1 AND c.parent_type = 'thread' AND c.parent_id IS NULL
            ORDER BY c.like_count DESC
            LIMIT $2 OFFSET $3;
        `;
        const commentsValues = [req.params.thread_id, limit, offset];
        const commentsResult = await pool.query(commentsQuery, commentsValues);
        const comments = commentsResult.rows;

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

        res.json({
            thread,
            totalCount,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching thread:", error)
        res.status(500).send({ error: "Internal server error" })
    }
}

// Function to update a thread
async function updateThread(req, res) {
    const { title, description, thread_type } = req.body
    if (!title || !description || !thread_type) {
        return res
            .status(400)
            .send({ error: "Thread form fields are required" })
    }

    if (filter.isProfane(title) || filter.isProfane(description)) {
        return res
            .status(400)
            .send({ message: "Thread contains inappropriate language." })
    }

    try {
        const query = `
            UPDATE "threads"
            SET "title" = $1, "description" = $2, "thread_type" = $3
            WHERE thread_id = $4
            RETURNING *;
        `
        const values = [title, description, thread_type, req.params.thread_id]
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
