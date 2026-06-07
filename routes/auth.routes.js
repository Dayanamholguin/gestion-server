const express = require("express");
const { login, me, cambiarPassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login",    login);
router.get("/me",        authMiddleware, me);
router.put("/password",  authMiddleware, cambiarPassword);

module.exports = router;
