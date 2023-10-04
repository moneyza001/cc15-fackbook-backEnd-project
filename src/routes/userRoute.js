const express = require("express");

const userController = require("../controllers/userController");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch(
    "/",
    authenticateMiddleware,
    uploadMiddleware.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    userController.updateProflie
);

module.exports = router;