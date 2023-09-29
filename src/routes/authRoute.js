const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const authenticateMiddleware = require("../middlewares/authenticate");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateMiddleware, getMe);

module.exports = router;
