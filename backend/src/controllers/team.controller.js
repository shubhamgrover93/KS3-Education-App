const db = require("../config/db"); // adjust path if needed
const getInitials = (nickname = "") =>
  nickname
    .split(" ")
    .map(word => word[0]?.toUpperCase())
    .join("");
exports.createTeam = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { class_id, name, members } = req.body;

    // Validation
    if (!class_id || !name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "classId, teamName and students are required",
      });
    }

    await connection.beginTransaction();

    // 1️⃣ Insert team
    const [teamResult] = await connection.execute(
      `INSERT INTO teams (class_id, name) VALUES (?, ?)`,
      [class_id, name]
    );

    const teamId = teamResult.insertId;

    // 2️⃣ Insert team members
    const memberValues = members.map(studentId => [
      class_id,
      teamId,
      studentId,
    ]);

    await connection.query(
      `INSERT INTO team_members (class_id, team_id, student_id)
       VALUES ?`,
      [memberValues]
    );

    // 3️⃣ Fetch full member info (same as getTeamsByClass)
    const [memberRows] = await connection.execute(
      `
      SELECT
        s.id,
        s.nickname,
        MAX(wc.week) AS challengeWeek
      FROM team_members tm
      JOIN students s ON s.id = tm.student_id

      LEFT JOIN weekly_challenge_responses wcr
        ON wcr.team_id = tm.team_id AND wcr.class_id = tm.class_id

      LEFT JOIN weekly_challenges wc
        ON wc.id = wcr.challenge_id

      WHERE tm.team_id = ?
      GROUP BY s.id
      `,
      [teamId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: {
        id: teamId,
        class_id,
        name,
        members: memberRows.map(m => ({
          id: m.id,
          nickname: m.nickname,
          initials: getInitials(m.nickname),
          challengeWeek: m.challengeWeek || 0
        }))
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Create Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    connection.release();
  }
};

exports.updateTeam = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { team_id, class_id, name, members } = req.body;

    // Validation
    if (!team_id || !name || !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "team_id, name and members are required",
      });
    }

    await connection.beginTransaction();

    // 1️⃣ Update team name
    await connection.execute(
      `UPDATE teams SET name = ? WHERE id = ?`,
      [name, team_id]
    );

    // 2️⃣ Remove old members
    await connection.execute(
      `DELETE FROM team_members WHERE team_id = ?`,
      [team_id]
    );

    // 3️⃣ Insert new members
    if (members.length > 0) {
      const values = members.map(studentId => [
        team_id,
        studentId,
        class_id
      ]);

      await connection.query(
        `INSERT INTO team_members (team_id, student_id, class_id) VALUES ?`,
        [values]
      );
    }
    const [memberRows] = await connection.execute(
      `
      SELECT
        s.id,
        s.nickname,
        MAX(wc.week) AS challengeWeek
      FROM team_members tm
      JOIN students s ON s.id = tm.student_id

      LEFT JOIN weekly_challenge_responses wcr
        ON wcr.team_id = tm.team_id AND wcr.class_id = tm.class_id

      LEFT JOIN weekly_challenges wc
        ON wc.id = wcr.challenge_id

      WHERE tm.team_id = ?
      GROUP BY s.id
      `,
      [team_id]
    );
    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: {
        id: team_id,
        class_id,
        name,
        members: memberRows.map(m => ({
          id: m.id,
          nickname: m.nickname,
          initials: getInitials(m.nickname),
          challengeWeek: m.challengeWeek || 0
        }))
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Update Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    connection.release();
  }
};

exports.deleteTeam = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { team_id } = req.params;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        message: "team_id is required",
      });
    }

    await connection.beginTransaction();

    //Delete team members
    await connection.execute(
      `DELETE FROM team_members WHERE team_id = ?`,
      [team_id]
    );

    // Delete team
    const [result] = await connection.execute(
      `DELETE FROM teams WHERE id = ?`,
      [team_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });

  } catch (error) {
    await connection.rollback();
    console.error("Delete Team Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    connection.release();
  }
};

exports.getTeamsByClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    let teamFilter = "";
    const params = [classId];

    if (studentId) {
      teamFilter = `
        AND EXISTS (
          SELECT 1
          FROM team_members tm2
          WHERE tm2.team_id = t.id
          AND tm2.student_id = ?
        )
      `;
      params.push(studentId);
    }

    // Get max week for this class
    const [[maxWeekRow]] = await db.execute(
      `SELECT MAX(week) AS maxWeek 
       FROM weekly_challenges 
       WHERE class_id = ?`,
      [classId]
    );

    const maxWeek = maxWeekRow?.maxWeek || 0;
    let currentWeek = maxWeek;
    // Check if next week exists
    const [[nextWeekRow]] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM weekly_challenges
       WHERE class_id = ? AND week = ?`,
      [classId, maxWeek + 1]
    );

    const nextWeekExists = nextWeekRow.count > 0;
    if(studentId){
      const [[reflectionRow]] = await db.execute(
          `SELECT COUNT(*) AS count
          FROM reflections r
          INNER JOIN weekly_challenges wc 
            ON wc.id = r.challenge_id
          WHERE r.student_id = ?
          AND r.class_id = ?
          AND wc.week = ?`,
          [studentId, classId, maxWeek]
        );

        const submittedReflection = reflectionRow.count > 0;

        

        if (submittedReflection && nextWeekExists) {
          currentWeek = maxWeek + 1;
        }
    }
    // Get teams + members
    const [rows] = await db.execute(
    `
    SELECT 
      t.id AS team_id,
      t.name AS team_name,
      s.id AS student_id,
      s.nickname,
      COUNT(wc.id) AS wc_count
    FROM teams t
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN students s ON s.id = tm.student_id
    LEFT JOIN weekly_challenge_responses wc
      ON wc.team_id = t.id 
      AND wc.class_id = t.class_id
    WHERE t.class_id = ?
    ${teamFilter}
    GROUP BY 
      t.id,
      t.name,
      s.id,
      s.nickname
    ORDER BY t.id
    `,
    params
  );

    const teamsMap = {};

    for (const row of rows) {
      if (!teamsMap[row.team_id]) {
        teamsMap[row.team_id] = {
          id: row.team_id,
          name: row.team_name,
          members: []
        };
      }

      if (row.student_id) {
        // Check if student submitted reflection for max week
        let progress = 0;
         if ( row.wc_count && row.wc_count > 0 ) {
        progress = row.wc_count
      }
        teamsMap[row.team_id].members.push({
          id: row.student_id,
          nickname: row.nickname,
          initials: getInitials(row.nickname),
          challengeWeek: progress,
        });
      }
    }

    res.json({
      success: true,
      currentWeek: currentWeek,
      data: Object.values(teamsMap)
    });

  } catch (error) {
    console.error("Get Teams Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};




