const db = require('../config/db');
const generateStudentCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
exports.joinClass = async (req, res) => {
  try {
    const { nickname, classCode } = req.body;

    if (!nickname || !classCode) {
      return res.status(400).json({
        success: false,
        message: "Nickname and class code are required",
      });
    }

    // 1️⃣ Find class
    const [[cls]] = await db.query(
      "SELECT * FROM classes WHERE class_code = ?",
      [classCode]
    );

    if (!cls) {
      return res.status(400).json({
        success: false,
        message: "Invalid class code",
      });
    }

    let studentId;
    let studentCode;

    // 2️⃣ Check if student already exists
    const [students] = await db.query(
      "SELECT id, student_code FROM students WHERE nickname = ?",
      [nickname]
    );

    if (students.length) {
      // Existing student
      studentId = students[0].id;
      studentCode = students[0].student_code;
    } else {
      // New student
      studentCode = generateStudentCode();
      const [s] = await db.query(
        "INSERT INTO students (nickname, student_code) VALUES (?, ?)",
        [nickname, studentCode]
      );
      studentId = s.insertId;
    }

    // 3️⃣ Join class (prevent duplicate)
    try {
      await db.query(
        "INSERT INTO class_students (class_id, student_id) VALUES (?, ?)",
        [cls.id, studentId]
      );
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.json({
          success: true,
          studentId,
          studentCode,
          classId: cls.id,
        });
      }
      throw err;
    }

    // 4️⃣ Create score if not exists
    try {
      await db.query(
        "INSERT INTO scores (class_id, student_id) VALUES (?, ?)",
        [cls.id, studentId]
      );
    } catch (err) {
      if (err.code !== "ER_DUP_ENTRY") throw err;
    }

    // 5️⃣ Emit Socket event
    const io = req.app.get("io");
    if (io) {
      io.to(classCode).emit("studentJoined", {
        studentId,
        nickname,
        studentCode,
        points: 0,
        stars: 0,
        reflections_count: 0,
      });
    }

    // ✅ RETURN studentCode ALSO
    res.json({
      success: true,
      studentId,
      studentCode,
      classId: cls.id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getStudentByCode = async (req, res) => {
  try {
    const { studentCode } = req.params;

    if (!studentCode) {
      return res.status(400).json({
        success: false,
        message: "Student code is required",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        s.id AS studentId,
        s.nickname,
        s.student_code,

        c.id AS classId,
        c.class_code AS classCode
      FROM students s
      LEFT JOIN class_students cs ON cs.student_id = s.id
      LEFT JOIN classes c ON c.id = cs.class_id
      WHERE s.student_code = ?
      `,
      [studentCode]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Invalid student code",
      });
    }

    // Group classes (student can join multiple)
    const student = {
      studentId: rows[0].studentId,
      nickname: rows[0].nickname,
      studentCode: rows[0].student_code,
      classes: [],
    };

    rows.forEach(row => {
      if (row.classId) {
        student.classes.push({
          classId: row.classId,
          className: row.className,
          classCode: row.classCode,
        });
      }
    });

    res.json({
      success: true,
      data: student,
    });

  } catch (error) {
    console.error("Get Student By Code Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
