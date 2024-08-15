const express = require("express");
const router = express.Router();
const { getMentors, createMentor } = require("../controllers/mentorController");

router.route("/").get(getMentors).post(createMentor);

module.exports = router;
