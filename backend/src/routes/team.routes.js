const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");

router.post("/teams", teamController.createTeam);
router.get("/teams/class/:classId", teamController.getTeamsByClass);
router.get("/teams/class/:classId/:studentId", teamController.getTeamsByClass);
router.post("/teams/update", teamController.updateTeam);
router.delete("/teams/:team_id", teamController.deleteTeam);
module.exports = router;
