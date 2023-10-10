const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const postController = require("../controllers/postController");
const likeController = require("../controllers/likeController");

const router = express.Router();

router.post(
    "/",
    authenticateMiddleware,
    uploadMiddleware.single("image"),
    postController.createPost
);

router.get(
    "/friend",
    authenticateMiddleware,
    postController.getAllPostIcludeFriendPost
);

router.post("/:postId/like", authenticateMiddleware, likeController.toggleLike);

router.delete("/:postId", authenticateMiddleware, postController.deletePost);

module.exports = router;
