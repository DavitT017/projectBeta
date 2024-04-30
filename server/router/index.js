const Router = require("express").Router
const userController = require("../controllers/user-controller")
const commentController = require("../service/comment-service")
const router = new Router()
const { body } = require("express-validator")

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

//Comics
router.get("/comics", commentController.getAllComics)
router.get("/comics/:comic_id", commentController.getComic)

// Comments
router.post("/comics/:comic_id/comments", commentController.createComment)
router.post("/comics/:comic_id/comments", commentController.createComment)

router.put(
    "/comics/:comic_id/comments/:comment_id",
    commentController.updateComment
)
router.delete(
    "/comics/:comic_id/comments/:comment_id",
    commentController.deleteComment
)
router.post(
    "/comics/:comic_id/comments/:comment_id/toggleLike",
    commentController.toggleLike
)

module.exports = router
