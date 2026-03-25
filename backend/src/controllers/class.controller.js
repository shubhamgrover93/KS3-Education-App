const db = require('../config/db');
const gen = require('../utils/generateCode');

// Helper function to generate initials
const getInitials = (nickname = "") =>
  nickname
    .split(" ")
    .map(word => word[0]?.toUpperCase())
    .join("");

exports.startClass = async (req, res) => {
  const code = gen();
  await db.query(
    'INSERT INTO classes (class_code) VALUES (?)',
    [code]
  );
  res.json({ success: true, classCode: code });
};

exports.scoreboard = async (req, res) => {
  try {
    const { code } = req.params;

    /* 1️⃣ Validate class */
    const [[cls]] = await db.query(
      'SELECT id, class_code FROM classes WHERE class_code = ?',
      [code]
    );

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    /* 2️⃣ Get all joined students + scores */
    const [rows] = await db.query(`
    SELECT 
      s.id AS studentId,
      s.nickname AS nickname,
      s.student_code,
      COALESCE(sc.points, 0) AS points,
      COALESCE(sc.stars, 0) AS stars,
      COALESCE(r.reflectionCount, 0) AS reflectionsCount
    FROM class_students cs
    JOIN students s 
      ON s.id = cs.student_id
    LEFT JOIN scores sc 
      ON sc.student_id = s.id 
    AND sc.class_id = cs.class_id
    LEFT JOIN (
      SELECT 
        student_id,
        class_id,
        COUNT(*) AS reflectionCount
      FROM reflections
      GROUP BY student_id, class_id
    ) r
      ON r.student_id = s.id
    AND r.class_id = cs.class_id
    WHERE cs.class_id = ?
  `, [cls.id]);


    /* 3️⃣ Normalize student objects */
    const students = rows.map(row => ({
      studentId: row.studentId,
      nickname: row.nickname,
      student_code: row.student_code,
      initials: getInitials(row.nickname),
      points: row.points,
      stars: row.stars,
      reflectionsCount: row.reflectionsCount
    }));

    /* 4️⃣ Scoreboard (sorted copy) */
    const scoreboard = [...students].sort(
      (a, b) => b.points - a.points
    );

    /* 5️⃣ Response */
    res.json({
      success: true,
      class: {
        code: cls.class_code,
        classId: cls.id,
        totalStudents: students.length
      },
      students,    // all joined students
      scoreboard   // ranked students with nickname
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scoreboard'
    });
  }
};

exports.listClasses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        class_code,
        DATE_FORMAT(created_at, '%b %d, %Y') AS createdDate
      FROM classes
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      total: rows.length,
      classes: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes'
    });
  }
};
