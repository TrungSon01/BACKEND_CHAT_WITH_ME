const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { getChatHistory, getAllUsersExceptMe } = require("../controllers/messageController");

router.post("/register", register);
router.post("/login", login);
router.get("/messages", getChatHistory);
router.get("/users", getAllUsersExceptMe);

module.exports = router;
