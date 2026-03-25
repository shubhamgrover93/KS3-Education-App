const db = require("../config/db");

exports.createWeeklyChallenge = async (req, res) => {
  try {
    const {
      classId,
      week,
      title,
      subTitle,
      description,
      options,
      id, // optional: pass for updates
    } = req.body;

    // Validate required fields
    if (!classId || !week || !title || !options?.length) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // If updating, check if the challenge exists
    if (id) {

      // Update the existing challenge
      await db.execute(
        `
        UPDATE weekly_challenges
        SET class_id = ?, week = ?, title = ?, sub_title = ?, description = ?, options = ?
        WHERE id = ?
        `,
        [
          classId,
          week,
          title,
          subTitle || null,
          description || null,
          JSON.stringify(options),
          id,
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Weekly challenge updated successfully",
      });
    } else {
      // Check if challenge for this class and week already exists
      const [existingWeek] = await db.execute(
        `SELECT id FROM weekly_challenges WHERE class_id = ? AND week = ?`,
        [classId, week]
      );

      if (existingWeek.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Challenge for ${week} already exists for this class`,
        });
      }

      // Insert new challenge
      await db.execute(
        `
        INSERT INTO weekly_challenges
        (class_id, week, title, sub_title, description, options)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          classId,
          week,
          title,
          subTitle || null,
          description || null,
          JSON.stringify(options),
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Weekly challenge created successfully",
      });
    }
  } catch (error) {
    console.error("Create/Update Weekly Challenge Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getWeeklyChallenges = async (req, res) => {
  try {
    const { classId } = req.params;
    const { week, teamId } = req.query; // pass teamId from frontend

    let query = `
      SELECT 
        wc.id,
        wc.class_id,
        wc.week,
        wc.title,
        wc.sub_title,
        wc.description,
        wc.options,
        wc.created_at,
        wcr.selected_option
      FROM weekly_challenges wc
      LEFT JOIN weekly_challenge_responses wcr
        ON wcr.challenge_id = wc.id
        ${teamId ? "AND wcr.team_id = ?" : ""}
      WHERE wc.class_id = ?
    `;

    const params = [];

    if (teamId) {
      params.push(teamId);
    }

    params.push(classId);

    if (week) {
      query += " AND wc.week = ?";
      params.push(week);
    }

    query += " ORDER BY wc.created_at DESC";

    const [rows] = await db.execute(query, params);

    const challenges = rows.map((row) => {
      let options = [];

      if (Array.isArray(row.options)) {
        options = row.options;
      } else if (typeof row.options === "string") {
        try {
          options = JSON.parse(row.options);
        } catch (err) {
          options = row.options
            .split(",")
            .map((opt) => opt.trim())
            .filter(Boolean);
        }
      }

      return {
        id: row.id,
        class_id: row.class_id,
        week: row.week,
        title: row.title,
        sub_title: row.sub_title,
        description: row.description,
        options,
        selected_option: row.selected_option || null,
        created_at: row.created_at,
      };
    });

    res.status(200).json({
      success: true,
      data: challenges,
    });
  } catch (error) {
    console.error("Get Weekly Challenges Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteWeeklyChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Challenge ID is required",
      });
    }

    // Check if challenge exists
    const [existing] = await db.execute(
      "SELECT id FROM weekly_challenges WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Delete challenge
    await db.execute(
      "DELETE FROM weekly_challenges WHERE id = ?",
      [id]
    );
    //delte reflections for challenge
    await db.execute(
      "DELETE FROM reflections WHERE challenge_id = ?",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Weekly challenge deleted successfully",
    });
  } catch (error) {
    console.error("Delete Weekly Challenge Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.submitWeeklyChallengeResponse = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { classId, studentId, selectedOption } = req.body;

    if (!studentId || !selectedOption || !classId) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // 1️⃣ Get team_id
    const [teamRows] = await db.execute(
      `
      SELECT t.id AS team_id
      FROM teams t
      INNER JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.student_id = ? AND t.class_id = ?
      LIMIT 1
      `,
      [studentId, classId]
    );

    const teamId = teamRows.length ? teamRows[0].team_id : null;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Student is not part of any team",
      });
    }

    // 2️⃣ Check if team already submitted
    const [existing] = await db.execute(
      `
      SELECT id
      FROM weekly_challenge_responses
      WHERE challenge_id = ?
        AND class_id = ?
        AND team_id = ?
      LIMIT 1
      `,
      [challengeId, classId, teamId]
    );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "Your team has already submitted this challenge",
      });
    }

    // 3️⃣ Insert response
    const query = `
      INSERT INTO weekly_challenge_responses
      (challenge_id, class_id, team_id, student_id, selected_option)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      challengeId,
      classId,
      teamId,
      studentId,
      selectedOption,
    ]);

    res.status(201).json({
      success: true,
      message: "Challenge response saved successfully",
    });

  } catch (error) {
    console.error("Submit Weekly Challenge Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getWeeklyChallengeResponses = async (req, res) => {
  try {
    const { classId } = req.params;
    const { week } = req.query;

    if (!week) {
      return res.status(400).json({
        success: false,
        message: "Week is required",
      });
    }

    const query = `
      SELECT
        wcr.id,
        s.nickname  AS student_name,
        wc.week,
        wc.title,
        wc.sub_title,
        wc.description,
        wcr.student_id,
        wcr.class_id,
        wcr.challenge_id,
        wcr.selected_option,
        wcr.created_at
      FROM weekly_challenge_responses wcr
      JOIN weekly_challenges wc ON wc.id = wcr.challenge_id
      JOIN students s ON s.id = wcr.student_id
      WHERE wc.class_id = ?
        AND wc.week = ?
      ORDER BY wcr.created_at DESC
    `;

    const [rows] = await db.execute(query, [classId, week]);

    const responses = rows.map((row) => ({
      studentName: row.student_name,
      initials: row.student_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
        class_id: row.class_id,
        class_id: row.challenge_id,
        class_id: row.student_id,
        week: row.week,
        title: row.title,
        sub_title: row.sub_title,
        description: row.description,
        selected_option: row.selected_option
    }));

    res.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    console.error("Get Weekly Responses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getWeeklyChallengeStudentResponses = async (req, res) => {
  try {
    const { classId, teamId } = req.params;
    const { week } = req.query;

    let query = `
      SELECT
        wcr.id,
        s.nickname AS student_name,
        wc.week,
        wc.title,
        wc.sub_title,
        wc.description,
        wcr.student_id,
        wcr.class_id,
        wcr.team_id,
        wcr.challenge_id,
        wcr.selected_option,
        wcr.created_at
      FROM weekly_challenge_responses wcr
      JOIN weekly_challenges wc ON wc.id = wcr.challenge_id
      JOIN students s ON s.id = wcr.student_id
      WHERE wc.class_id = ?
    `;

    const params = [parseInt(classId, 10)];

    // ✅ Add week filter only if provided
    if (week) {
      query += " AND wc.week = ?";
      params.push(parseInt(week, 10));
    }

    // ✅ Optional team filter
    if (teamId) {
      query += " AND wcr.team_id = ?";
      params.push(parseInt(teamId, 10));
    }

    query += " ORDER BY wc.week ASC, wcr.created_at DESC";

    console.log("Query:", query);
    console.log("Params:", params);

    const [rows] = await db.execute(query, params);

    const responses = rows.map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      initials: row.student_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      classId: row.class_id,
      challengeId: row.challenge_id,
      week: row.week,
      title: row.title,
      subTitle: row.sub_title,
      description: row.description,
      selectedOption: row.selected_option,
      createdAt: row.created_at,
    }));

    res.status(200).json({
      success: true,
      data: responses,
    });

  } catch (error) {
    console.error("Get Weekly Responses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




