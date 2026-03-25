const db = require('../config/db');
const dayjs = require('dayjs');

exports.submit = async (req, res) => {
  const { classId, studentId, challengeId, text, emoji, currentWeek } = req.body;
  const week = dayjs().startOf('week').format('YYYY-MM-DD');

  try {

    // Check if reflection already exists for this student + challenge
    const [existing] = await db.query(
      'SELECT id FROM reflections WHERE student_id = ? AND challenge_id = ?',
      [studentId, challengeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a reflection for this challenge'
      });
    }

    // Insert (keep week_start column)
    await db.query(
      `INSERT INTO reflections 
       (class_id, student_id, challenge_id, week_start, text, emoji, week) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [classId, studentId, challengeId, week, text, emoji, currentWeek]
    );

    res.json({
      success: true,
      message: 'Reflection submitted successfully'
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.history = async (req, res) => {
  const { studentId, classId, week } = req.params;

  const [rows] = await db.query(
    `SELECT 
       r.id,
       r.text,
       r.emoji,
       wc.selected_option,
       c.title,
       r.created_at,
       s.nickname AS student_nickname
     FROM reflections r
     JOIN students s ON s.id = r.student_id
     JOIN weekly_challenges c ON r.challenge_id = c.id
     JOIN weekly_challenge_responses wc ON r.challenge_id = wc.challenge_id
     WHERE r.student_id = ? 
       AND r.class_id = ?
       AND r.week = ?
     ORDER BY r.created_at DESC`,
    [studentId, classId, week]
  );

  const formatted = rows.map(r => ({
    id: r.id,
    text: r.text,
    emoji: r.emoji,
    nickname: r.student_nickname,
    selected_option: r.selected_option,
    title: r.title,
    date: dayjs(r.created_at).format("DD MMM YYYY")
  }));

  res.json({
    success: true,
    data: formatted
  });
};


exports.teacherHistory = async (req, res) => {
  try {
    const { classId, week, team_id } = req.params;

    let query = `
      SELECT 
        r.id,
        r.text,
        r.emoji,
        wc.selected_option,
        c.title,
        r.week_start,
        r.created_at,
        s.id AS studentId,
        s.nickname AS studentName
      FROM reflections r
      JOIN students s ON s.id = r.student_id
      JOIN weekly_challenges c ON r.challenge_id = c.id
      JOIN weekly_challenge_responses wc ON r.challenge_id = wc.challenge_id
      WHERE r.class_id = ? and r.week = ? and wc.team_id = ?
    `;

    const params = [classId,week,team_id];

    // ✅ Handle specific week (Week 1, 2, 3...)
    // if (week && week !== "all") {
    //   query += `
    //     AND r.week = (
    //       SELECT week_start
    //       FROM (
    //         SELECT DISTINCT week_start
    //         FROM reflections
    //         WHERE class_id = ?
    //         ORDER BY week_start ASC
    //         LIMIT 1 OFFSET ?
    //       ) w
    //     )
    //   `;
    //   params.push(classId, Number(week) - 1);
    // }

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await db.query(query, params);

    const formatted = rows.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      emoji: r.emoji,
      selected_option: r.selected_option,
      title: r.title,
      text: r.text,
      date: dayjs(r.created_at).format("DD MMM YYYY"),
      weekStart: dayjs(r.week_start).format("DD MMM YYYY")
    }));

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reflections history"
    });
  }
};

