const express = require("express");
const router = express.Router();
const { getMentorSession,scheduleSession } = require("../controllers/schedulerController");

router.route("/").get(getMentorSession).post(scheduleSession);

module.exports = router;
