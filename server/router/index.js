const Router = require("express").Router
const userController = require("../controllers/user-controller")
const commentController = require("../service/c_comment-service")
const threadController = require("../service/t_comment-service")
const router = new Router()
const { body } = require("express-validator")
const roleMiddleware = require("../middlewares/role-middleware")

router.post(
    "/registration",
    body("email").isEmail(),
    body("password").isLength({ min: 6, max: 20 }),
    userController.registration
)

router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.get("/activate/:link", userController.activate)
router.get("/refresh", userController.refresh)
router.post("/block/:id", roleMiddleware(["ADMIN"]), userController.blockUser)

//Comics
router.get("/comics", commentController.getAllComics)
router.get("/comics/:comic_id", commentController.getComic)

// Comments
router.post(
    "/comics/:comic_id/comments",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    commentController.createComment
)

router.put(
    "/comics/:comic_id/comments/:comment_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    commentController.updateComment
)

router.delete(
    "/comics/:comic_id/comments/:comment_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    commentController.deleteComment
)

router.post(
    "/comics/:comic_id/comments/:comment_id/like",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    commentController.likeComment
)

router.post(
    "/comics/:comic_id/comments/:comment_id/unlike",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    commentController.unlikeComment
)

//Threads
router.get("/threads", threadController.getAllThreadsWithComments)
router.get("/threads/:thread_id", threadController.getThreadWithComments)
router.post("/threads", threadController.createThread)
router.put(
    "/threads/:thread_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    threadController.updateThread
)
router.delete(
    "/threads/:thread_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    threadController.deleteThread
)

//Thread Comments
router.post(
    "/threads/:thread_id/comments",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    threadController.createThreadComment
)

router.put(
    "/threads/:thread_id/comments/:comment_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    commentController.updateComment
)

router.delete(
    "/threads/:thread_id/comments/:comment_id",
    roleMiddleware(["ADMIN", "MODERATOR"]),
    commentController.deleteComment
)

router.post(
    "/threads/:thread_id/comments/:comment_id/like",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    commentController.likeComment
)

router.post(
    "/threads/:thread_id/comments/:comment_id/unlike",
    roleMiddleware(["USER", "ADMIN", "MODERATOR"]),
    commentController.unlikeComment
)

module.exports = router
