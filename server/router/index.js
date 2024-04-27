const Router = require("express").Router
const userController = require("../controllers/user-controller")
const commentController = require("../service/comment-service")
const router = new Router()
const { body } = require("express-validator")
const authMiddleware = require("../middlewares/auth-middleware")

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

//Create Comment
router.post("/:id/comments", commentController.createComment)
//Update Comment
router.put("/:comic_id/comments/:comment_id", commentController.updateComment)
router.delete(
	"/:comic_id/comments/:comment_id",
	commentController.deleteComment
)
router.post(
	"/:comic_id/comments/:comment_id/toggleLike",
	commentController.toggleLike
)
router.get("/:id/comments",commentController.getComments)

module.exports = router
