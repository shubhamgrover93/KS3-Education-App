const express = require("express");
const router = express.Router();
const { giveAwards, getStudentAwards } = require("../controllers/awardController");

router.post("/give", giveAwards);
router.get(
  "/student/:classId/:studentId",
  getStudentAwards
);
module.exports = router;
