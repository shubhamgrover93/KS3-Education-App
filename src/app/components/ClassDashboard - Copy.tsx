import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { io, Socket } from "socket.io-client";
import { useRef } from "react";
import {
  Copy,
  Check,
  ArrowLeft,
  Users,
  Star,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

interface Student {
  studentId: number;
  nickname: string;
  initials: string;
  points: number;
  stars: number;
}

export default function ClassDashboard() {
  const socketRef = useRef<Socket | null>(null);
  const { code } = useParams();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN;

  const [classCode, setClassCode] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreboard, setScoreboard] = useState<Student[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(true);

  const joinUrl = `${DOMAIN_URL}join/${classCode}`;

  /* ---------------- Helpers ---------------- */

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getAvatarColor = (index: number) => {
    const colors = ["#F78C2B", "#1C2C5B", "#E76F51", "#8AB4F8", "#F4A5D7"];
    return colors[index % colors.length];
  };

  const copyToClipboard = async (text: string, type: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Class code copied!");
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
        toast.success("Join URL copied!");
      }
    } catch {
      toast.error("Failed to copy");
    }
  };

  /* ---------------- API CALL ---------------- */

  useEffect(() => {
    if (!code) return;

    const CLASS_CODE = code.toUpperCase();
    setClassCode(CLASS_CODE);

    const fetchScoreboard = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}class/${CLASS_CODE}/scoreboard`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error("Failed to load class data");
          return;
        }

        const formattedStudents = data.students.map((s: any) => ({
          ...s,
          initials: getInitials(s.nickname),
        }));

        const formattedScoreboard = data.scoreboard.map((s: any) => ({
          ...s,
          initials: getInitials(s.nickname),
        }));

        setStudents(formattedStudents);
        setScoreboard(formattedScoreboard);
      } catch (err) {
        toast.error("Server error while loading class");
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboard();
  }, [code]);

 /* ================= SOCKET CONNECTION ================= */

  const socket = io(API_BASE_URL.replace("/api/", ""), {
    transports: ["websocket"],
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("Teacher connected:", socket.id);
    socket.emit("joinClassRoom", classCode);
  });

  socket.on("studentJoined", (student: any) => {
    console.log("👨‍🎓 Student joined:", student);

    const newStudent = {
      studentId: student.studentId,
      nickname: student.nickname,
      points: student.points ?? 0,
      stars: student.stars ?? 0,
      initials: getInitials(student.nickname),
    };

    // Update students list
    setStudents((prev) => {
      const exists = prev.some(
        (s) => s.studentId === newStudent.studentId
      );
      if (exists) return prev;
      return [...prev, newStudent];
    });

    // Update scoreboard
    setScoreboard((prev) => {
      const exists = prev.some(
        (s) => s.studentId === newStudent.studentId
      );
      if (exists) return prev;
      return [...prev, newStudent];
    });

    toast.success(`${student.nickname} joined the class 🎉`);
  });

  socket.on("disconnect", () => {
    console.log("Teacher disconnected");
  });

  const sortedStudents = [...scoreboard].sort(
    (a, b) => b.points - a.points
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading class data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/teacher")}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all hover:shadow-md"
            style={{ backgroundColor: "white", color: "#333333" }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 style={{ color: "#333333", fontSize: "2.5rem" }}>
                Class {classCode}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Users size={20} style={{ color: "#1C2C5B" }} />
                  <span style={{ color: "#333333", opacity: 0.7 }}>
                    {students.length} students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#1C2C5B" }}
                  ></div>
                  {/* <span style={{ color: "#333333", opacity: 0.7 }}>
                    {onlineCount} online
                  </span> */}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Section 1: Class Sharing Panel */}
          <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div
              className="rounded-3xl p-6 bg-white sticky top-6"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              <h3 className="mb-6 flex items-center gap-2" style={{ color: "#333333", fontSize: "1.5rem" }}>
                🔑 Class Sharing
              </h3>

              {/* Class Code */}
              <div className="mb-6">
                <label className="block mb-3" style={{ color: "#333333", fontSize: "0.875rem" }}>
                  Class Code
                </label>
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: "#FFF5ED", border: "2px solid #F78C2B" }}
                >
                  <span
                    style={{
                      color: "#333333",
                      fontSize: "1.5rem",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {classCode}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(classCode, "code")}
                    className="p-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: copiedCode ? "#1C2C5B" : "#F78C2B",
                      color: "white",
                    }}
                  >
                    {copiedCode ? <Check size={20} /> : <Copy size={20} />}
                  </motion.button>
                </div>
              </div>

              {/* Join URL */}
              <div className="mb-6">
                <label className="block mb-3" style={{ color: "#333333", fontSize: "0.875rem" }}>
                  Join URL
                </label>
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: "#F0F9F8", border: "2px solid #1C2C5B" }}
                >
                  <span
                    className="flex-1 truncate mr-2 text-sm"
                    style={{ color: "#333333" }}
                  >
                    {joinUrl}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(joinUrl, "url")}
                    className="p-2 rounded-xl transition-all flex-shrink-0"
                    style={{
                      backgroundColor: copiedUrl ? "#F78C2B" : "#1C2C5B",
                      color: "white",
                    }}
                  >
                    {copiedUrl ? <Check size={20} /> : <Copy size={20} />}
                  </motion.button>
                </div>
              </div>

              {/* Quick Stats */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: "#F5F5F5" }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "#333333", fontSize: "0.875rem" }}>Total Students</span>
                  <span style={{ color: "#333333", fontSize: "1.25rem" }}>{students.length}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span style={{ color: "#333333", fontSize: "0.875rem" }}>Online Now</span>
                  <span style={{ color: "#1C2C5B", fontSize: "1.25rem" }}>{onlineCount}</span>
                </div> */}
                {/* <div className="flex items-center justify-between">
                  <span style={{ color: "#333333", fontSize: "0.875rem" }}>Total Points</span>
                  <span style={{ color: "#F78C2B", fontSize: "1.25rem" }}>
                    {students.reduce((sum, s) => sum + s.points, 0)}
                  </span>
                </div> */}
              </div>
            </div>
          </motion.div>
          {/* Student Reflections */}
          {/* <div className="bg-white rounded-3xl p-6 mt-6">
            <div className=" flex flex-col gap-4 justify-between items-start mb-6">
              <h3 className="text-xl">💬 Student Reflections</h3>
              <button
                onClick={downloadSummary}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1C2C5B] text-white"
              >
                <Download size={18} />
                Download Summary
              </button>
              </div>
            {StudentRefection.length === 0 ? (
              <p className="text-center opacity-60">
                Reflections will appear here once students respond.
              </p>
            ) : (
              <div className="grid sm:grid-cols-1 gap-4">
                {StudentRefection.map((StudentRefection, index) => {
                  const hasReflection = !!StudentRefection.reflection;

                  return (
                    <motion.div
                      key={StudentRefection.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl p-4 bg-[#F5F5F5] flex gap-4"
                    >

                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ background: getAvatarColor(index) }}
                      >
                        {StudentRefection.initials}
                      </div>


                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{StudentRefection.nickname}</p>
                          {hasReflection ? (
                            <CheckCircle size={16} color="#1C2C5B" />
                          ) : (
                            <Clock size={16} color="#E76F51" />
                          )}
                        </div>

                        {hasReflection ? (
                          <div className="mt-2 space-y-1">
                            <div className="text-2xl">
                              {StudentRefection.reflection?.emoji}
                            </div>
                            {StudentRefection.reflection?.comment && (
                              <div className="flex items-start gap-2 text-sm">
                                <MessageCircle size={14} className="mt-1" />
                                <p>{StudentRefection.reflection.comment}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm opacity-60">
                            Reflection not submitted yet
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div> */}
          </div>
          {/* Right Column: Students & Scoreboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 2: Students List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2" style={{ color: "#333333", fontSize: "1.5rem" }}>
                  👨‍🎓 Students
                </h3>
                <span
                  className="px-4 py-2 rounded-full"
                  style={{ backgroundColor: "#E7F6F3", color: "#1C2C5B", fontSize: "0.875rem" }}
                >
                  {students.length} enrolled
                </span>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
                    style={{ backgroundColor: "#F5F5F5" }}
                  >
                    <Users size={32} style={{ color: "#333333", opacity: 0.3 }} />
                  </div>
                  <p style={{ color: "#333333", opacity: 0.6 }}>
                    Waiting for students to join…
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {students.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl p-4 flex items-center gap-4"
                      style={{ backgroundColor: "#F5F5F5" }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(index), color: "white" }}
                      >
                        <span>{student.initials}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="truncate" style={{ color: "#333333" }}>
                            {student.nickname}
                          </p>
                          
                        </div>
                        <p style={{ color: "#333333", opacity: 0.5, fontSize: "0.75rem" }}>
                         
                        </p>
                      </div>

                      {/* Points Badge */}
                      <div
                        className="px-3 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                        style={{ backgroundColor: "#FFF5ED" }}
                      >
                        <Star size={14} style={{ color: "#F78C2B" }} fill="#F78C2B" />
                        <span style={{ color: "#F78C2B", fontSize: "0.875rem" }}>
                          {student.points}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Section 3: Student Scoreboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              <h3 className="flex items-center gap-2 mb-6" style={{ color: "#333333", fontSize: "1.5rem" }}>
                🏆 Scoreboard
              </h3>

              {students.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={48} style={{ color: "#333333", opacity: 0.2, margin: "0 auto 1rem" }} />
                  <p style={{ color: "#333333", opacity: 0.6 }}>
                    Scoreboard will appear when students join
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedStudents.map((student, index) => {
                    const rank = index + 1;
                    const isTopThree = rank <= 3;
                    const trophyEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="rounded-2xl p-4 flex items-center gap-4"
                        style={{
                          backgroundColor: isTopThree ? "#F5F5F5" : "#F5F5F5",
                          border: isTopThree ? "none" : "none",
                        }}
                      >

                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isTopThree ? "#1C2C5B" : "#1C2C5B",
                            color: "white",
                          }}
                        >
                          <span style={{ fontSize: isTopThree ? "1.25rem" : "1rem" }}>
                            {rank}
                          </span>
                        </div>

                        {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(index), color: "white" }}
                      >
                        <span>{student.initials}</span>
                      </div>


                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ color: "#333333" }}>
                            {student.nickname}
                          </p>
                        </div>


                        <div className="flex items-center gap-2">
                          <Star
                            size={20}
                            style={{ color: "#F78C2B" }}
                            fill="#F78C2B"
                          />
                          <span style={{ color: "#333333", fontSize: "1.25rem" }}>
                            {student.points}
                          </span>
                        </div>


                        {isTopThree && (
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <TrendingUp size={20} style={{ color: "#1C2C5B" }} />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
