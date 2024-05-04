const Router = require("express").Router
const userController = require("../controllers/user-controller")
const commentController = require("../service/comment-service")
const router = new Router()
const { body } = require("express-validator")
// Import the role middleware
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
router.post("/block/:id", roleMiddleware(['ADMIN']),userController.blockUser)

//Comics
router.get("/comics", commentController.getAllComics)
router.get("/comics/:comic_id", commentController.getComic)

// Comments
router.post(
	"/comics/:comic_id/comments",
	roleMiddleware(['USER', 'ADMIN', 'MODERATOR']),
	commentController.createComment
)

router.put(
	"/comics/:comic_id/comments/:comment_id",
	roleMiddleware(['ADMIN', 'MODERATOR']),
	commentController.updateComment
)
router.delete(
	"/comics/:comic_id/comments/:comment_id",
    roleMiddleware(['ADMIN', 'MODERATOR']),
	commentController.deleteComment
)
router.post(
	"/comics/:comic_id/comments/:comment_id/toggleLike",
	commentController.toggleLike
)

module.exports = router
