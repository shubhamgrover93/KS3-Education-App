const db = require("../config/db");

// controllers/awardController.js
exports.getStudentAwards = async (req, res) => {
  const { classId, studentId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT award_id
      FROM student_awards
      WHERE class_id = ? AND student_id = ?
      ORDER BY created_at DESC
      `,
      [classId, studentId]
    );

    res.json({
      success: true,
      awards: rows.map(r => r.award_id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


exports.giveAwards = async (req, res) => {
  const { classId, studentId, awardIds } = req.body;

  // Safety checks
  if (!classId || !studentId || !Array.isArray(awardIds) || !awardIds.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }


  try {
    // 1️⃣ Fetch awards & calculate totals
    const [awards] = await db.query(
      `SELECT id, points FROM awards WHERE id IN (?)`,
      [awardIds]
    );

    if (!awards.length) {
      return res.status(404).json({
        success: false,
        message: "Awards not found",
      });
    }

    const totalPoints = awards.reduce((sum, a) => sum + a.points, 0);
    const totalStars = awards.length;

    // 2️⃣ Insert award history (bulk insert)
    const awardLogs = awards.map((a) => [
      classId,
      studentId,
      a.id
    ]);
    //console.log(awardLogs);
    await db.query(
      `INSERT INTO student_awards 
       (class_id, student_id, award_id)
       VALUES ?`,
      [awardLogs]
    );

    // 3️⃣ Update scores table
    await db.query(
      `
      INSERT INTO scores (class_id, student_id, points, stars)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        stars  = stars  + VALUES(stars)
      `,
      [classId, studentId, totalPoints, totalStars]
    );

    // 4️⃣ Socket update
    const io = req.app.get("io");
    io?.to(`class_${classId}`).emit("scoreUpdated", {
      studentId,
      points: totalPoints,
      stars: totalStars,
    });

    res.json({
      success: true,
      message: "Awards assigned successfully",
    });

  } catch (err) {
    console.error("Award error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to assign awards",
    });
  }
};
