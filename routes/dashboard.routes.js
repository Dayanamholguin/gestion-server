const express = require("express");
const { stats } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/stats", stats);

module.exports = router;
