const express = require("express");
const router = express.Router();
const {
  createWeeklyChallenge, getWeeklyChallenges, submitWeeklyChallengeResponse, getWeeklyChallengeResponses, deleteWeeklyChallenge, getWeeklyChallengeStudentResponses
} = require("../controllers/weeklyChallenge.controller");

router.post("/weekly-challenges", createWeeklyChallenge);
router.get("/weekly-challenges/:classId", getWeeklyChallenges);
router.post(
  "/weekly-challenges/:challengeId/response",
  submitWeeklyChallengeResponse
);
router.get(
  "/weekly-challenges/:classId/responses",
  getWeeklyChallengeResponses
);
router.get(
  "/weekly-student-challenges/:classId/:teamId/responses",
  getWeeklyChallengeStudentResponses
);
router.delete("/weekly-challenges/:id", deleteWeeklyChallenge);
module.exports = router;
