const db = require('../config/db');

exports.assign = async (req, res) => {
  const { classId, studentId, points, stars } = req.body;
  
//   const [logs] = await db.query(
//   'SELECT * FROM scores WHERE class_id = ? AND student_id = ?',
//   [classId, studentId]
// );
// if (logs.length) return res.status(400).json({ 'success': false, message: 'Score already assigned' });

  await db.query(
    `INSERT INTO scores (class_id, student_id, points, stars)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       points = VALUES(points),
       stars = VALUES(stars)`,
    [classId, studentId, points, stars]
  );

  res.json({ 'success': true, message: 'Score updated successfully!' });
};