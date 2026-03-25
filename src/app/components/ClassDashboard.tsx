import { useEffect, useState, useMemo  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useRef } from "react";
import MannersIcon from "./../../assets/microphone_manners.svg"
import TeacherWeeklyChallenge from "./TeacherWeeklyChallenge.tsx";

import TeacherChallengeModal, {
  ChallengeData
} from "./TeacherChallengeModal"
import {
  Copy,
  Check,
  ArrowLeft,
  Users,
  User,
  Star,
  Trophy,
  TrendingUp,
  Plus,
  Award,
  Pencil, 
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

interface Student {
  studentId: string;
  nickname: string;
  initials: string;
  student_code: string,
  points: number;
  stars: number;
  awards?: string[];
}


// /* ✅ ADD THIS */
// const teacher = {
//   name: "Ms. Sarah Johnson",
//   role: "Class Teacher",
//   initials: "SJ",
// };
// Team interface
interface Team {
  id: number;
  name: string;
  memberIds: string[]; // store student IDs
  progress: string; // Week 1, Week 2, Not Started
}
const AWARDS = [
  {
    id: "proactive",
    name: "Being Proactive",
    icon: "🚀",
    color: "#1C2C5B",
  },
   {
    id: "mic-manners",
    name: "Microphone Manners",
    icon: (
      <img
        src={MannersIcon}
        alt="Microphone Manners"
        className="w-7 h-7"
      />
    ),
    color: "#E76F51", // coral
  },
  {
    id: "growth-mindset",
    name: "Growth Mindset",
    icon: "🌱",
    color: "#9B8AE6",
  },
  {
    id: "focused",
    name: "Focused Learner",
    icon: "💡",
    color: "#F78C2B",
  },
  {
    id: "respectful",
    name: "Respectful Communicator",
    icon: "🤝",
    color: "#1C2C5B",
  },
  {
    id: "prepared",
    name: "Prepared & Ready",
    icon: "🎯",
    color: "#E76F51",
  },
];

interface TeamReflection {
  name: string; // Team name
  color: string; // color for the team circle
  initials: string; // Team initials, e.g., "TA" for Team Alpha
  emoji: string; // optional emoji for the team's reflection
  selected_option: string; // optional emoji for the team's reflection
  text: string; // collective reflection text
}



export default function ClassDashboard() {
  const socketRef = useRef<Socket | null>(null);
  const { code } = useParams();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN;

  const [classCode, setClassCode] = useState("");
  const [classId, setclassId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreboard, setScoreboard] = useState<Student[]>([]);
  const [reflections, setReflections] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<Student[]>(students);
  const joinUrl = `${DOMAIN_URL}join/${classCode}`;
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);
  const [activeReflection, setActiveReflection] = useState<{
    initials: string
    name: string
    emoji: string
    title: string
    selected_option: string
    text: string
  } | null>(null)

  // const [teacherText, setTeacherText] = useState("")

    // Challenges
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  
  const [editingChallenge, setEditingChallenge] = useState<{
    challenge: ChallengeData;
    index: number;
  } | null>(null);

    /* ---------------- Helpers ---------------- */
    const handleEditTeam = (team: any) => {
    setIsEditMode(true);
    setEditingTeamId(team.id);

    setNewTeamName(team.name);

    // select ONLY current team members
    const memberIds = team.members.map((m: any) => m.id);
    setSelectedTeamMembers(memberIds);

    setTeamModalOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeamId) return;

    if (!newTeamName.trim()) {
      toast.error("Team name required");
      return;
    }

    // API payload
    const payload = {
      team_id: editingTeamId,
      name: newTeamName,
      class_id: classId,
      members: selectedTeamMembers,
    };
    try {
      const res = await fetch(`${API_BASE_URL}teams/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create team");
        return;
      }

      setTeams((prev: any[]) =>
          prev.map((team) =>
            Number(team.id) === Number(data.data.id)
              ? data.data
              : team
          )
        );

      toast.success("Team updated successfully");
      setTeamModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }

    // call update API here

    setTeamModalOpen(false);
    setIsEditMode(false);
    setEditingTeamId(null);
  };
   
      const handleDeleteTeam = async (teamId: number) => {

      try {
        const res = await fetch(
          `${API_BASE_URL}teams/${teamId}`,
          {
            method: "DELETE",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to delete team");
          return;
        }

        // ✅ REMOVE team from UI (IMPORTANT)
        setTeams((prev: any[]) =>
          prev.filter((team) => Number(team.id) !== Number(teamId))
        );
        setDeleteTeamId(null);
        toast.success("Team deleted successfully");

      } catch (err) {
        console.error(err);
        toast.error("Server error");
      }
    };

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
    // Add Awards States 
    const [awardModalOpen, setAwardModalOpen] = useState(false);
    const [selectedAwards, setSelectedAwards] = useState<string[]>([]);
    const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
    
    const [selectedWeek, setSelectedWeek] = useState<number | "all">(1);
    
    // Add this to your useState
    const [teams, setTeams] = useState<Team[]>([]);

    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

    const toggleAward = (awardId: string) => {
      setSelectedAwards((prev) =>
        prev.includes(awardId)
          ? prev.filter((id) => id !== awardId)
          : [...prev, awardId]
      );
    };
  const copyToClipboard = async (text: string, type: "code" | "url") => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for HTTP
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

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
    toast.error("Copy not supported in this browser");
  }
};

  const assignedStudentIds = useMemo<number[]>(() => {
    if (!Array.isArray(teams)) return [];

    return teams
      .filter((t) => !isEditMode || t.id !== activeTeam?.id)
      .flatMap((t) =>
        Array.isArray(t.members)
          ? t.members.map((m: any) => m.id) // ✅ FIX HERE
          : []
      );
  }, [teams, isEditMode, activeTeam]);

console.log('assignedStudentIds',assignedStudentIds);
const availableStudents = useMemo(() => {
  if (!Array.isArray(students)) return [];

  return students.filter(
    (s) =>
      !assignedStudentIds.includes(
        Number(s.id ?? s.studentId)
      )
  );
}, [students, assignedStudentIds]);
  /* ---------------- API CALL ---------------- */
 const fetchReflections = async (week:number,team_id) => {
          fetch(`${API_BASE_URL}reflection/teacherHistory/${classId}/${week}/${team_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReflections(data.data);
          }
        })
        .catch(() =>
           console.log("Failed to load reflections")
      );
    };
  useEffect(() => {
    if (!code) return;
   // fetchReflections(1,activeTeam.id);
    const CLASS_CODE = code.toUpperCase();
    setClassCode(CLASS_CODE);

    const fetchTeams = async () => {
          fetch(`${API_BASE_URL}teams/class/${classId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTeams(data.data);
          }
        })
        .catch(() =>
           console.log("Failed to load teams")
      );
    };

   

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
        setclassId(data.class.classId);
        fetchTeams();
        
      } catch (err) {
        toast.error("Server error while loading class");
      } finally {
        setLoading(false);
      }
    };
    
    fetchScoreboard();
  }, [code,classId]);

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
      student_code: student.studentCode,
      nickname: student.nickname,
      points: student.points ?? 0,
      stars: student.stars ?? 0,
      reflections_count: 0,
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

    //toast.success(`${student.nickname} joined the class 🎉`);
  });

  socket.on("disconnect", () => {
    console.log("Teacher disconnected");
  });
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading class data...</p>
      </div>
    );
  }

  //Add Awards and Points To Students 

  
    const giveAward = async (studentId: number, stars:number, points:number) => {
    try {
      //  Optimistic UI update

      // API call
      const res = await fetch(`${API_BASE_URL}score/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: classId,
          studentId: studentId,
          points: points,
          stars: stars+1,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Award API failed");
      }
      setStudents(prev =>
        prev.map(s =>
          s.studentId === studentId
            ? { ...s, stars: s.stars+1 }
            : s
        )
      );
      toast.success("Award granted 🎖️");
    } catch (error) {
      // rollback UI on failure
      

      toast.error("Failed to grant award");
      console.error(error);
    }
  };
  

  // ✅ CREATE TEAM API
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    if (selectedTeamMembers.length === 0) {
      toast.error("Select at least one student");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: classId,
          name: newTeamName,
          members: selectedTeamMembers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create team");
        return;
      }

      // ✅ Update UI with backend response
      setTeams((prev: any[]) => [...prev, data.data]);

      toast.success("Team created successfully");
      setTeamModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const givePoints = async (studentId: number, points: number, stars:number) => {
    try {


      // 2️⃣ API call
      const res = await fetch(`${API_BASE_URL}score/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: classId,        
          studentId: studentId,
          points: points+1,
          stars: stars,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Points API failed");
      }
       setStudents(prev =>
        prev.map(s =>
          s.studentId === studentId
            ? { ...s, points: s.points+1 }
            : s
        )
      );
      toast.success(`+1 point added 🏆`);
    } catch (error) {
      // 🔁 rollback UI on failure
     

      toast.error("Failed to add points");
      console.error(error);
    }
  };

 const giveAwardsToStudent = async (
  studentId: string,
  awardIds: string[]
) => {
  try {
    const res = await fetch(`${API_BASE_URL}awards/give`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        studentId,
        awardIds,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message);
    }

    // Optimistic UI update
    setStudents(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? {
              ...s,
              stars: s.stars + awardIds.length,
              points: s.points,
            }
          : s
      )
    );

    toast.success(
      `${awardIds.length} award${awardIds.length > 1 ? "s" : ""} given 🎖️`
    );

    setSelectedAwards([]);
    setActiveStudentId(null);
    setAwardModalOpen(false);

  } catch (err) {
    toast.error("Failed to give awards");
    console.error(err);
  }
};


  // Sort students by points for scoreboard
  const sortedStudents = [...scoreboard].sort(
    (a, b) => b.points - a.points
  );

  const challenge: ChallengeData = {
    title: "Weekly Reading Sprint",
    category: "Literacy",
    // difficulty: "Medium",
    tags: ["Reading", "Focus", "Consistency"],
    description:
      "Students must complete at least 15 minutes of focused reading every day for one week. Teachers can track participation and reward consistency."
  }

  // Add new challenge
  const handleCreateChallenge = (challenge: ChallengeData) => {
    setChallenges(prev => [...prev, challenge]);
  };

  // Edit existing challenge
  const handleEditChallenge = (challenge: ChallengeData, index: number) => {
    const newChallenges = [...challenges];
    newChallenges[index] = challenge;
    setChallenges(newChallenges);
  };

  // Delete challenge
  const handleDeleteChallenge = (index: number) => {
    setChallenges(prev => prev.filter((_, i) => i !== index));
  };

  // Start challenge
  const handleStartChallenge = (challenge: ChallengeData) => {
    console.log("Starting challenge:", challenge);
  };
  const listStuidents = isEditMode ? students : availableStudents
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-3xl p-6"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            {/* Left: Teacher Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-semibold"
                style={{ backgroundColor: "#1C2C5B", color: "white" }}
              >
                  <User size={32} />
              </div>

              {/* Name */}
              <div>
                <h2 style={{ color: "#333333", fontSize: "1.5rem" }}>
                  Welcome, Teacher
                </h2>
                {/* <p style={{ color: "#333333", opacity: 0.6 }}>
                  {teacher.role}
                </p> */}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center text-sm gap-2 px-6 py-[12px] rounded-xl transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: '#1C2C5B',
                    color: 'white',
                    
                  }}
                >
                  <Plus size={20} />
                  Join Another Class
              </motion.button> */}
              
          {/* Class Info */}
          <div className="flex flex-col items-start gap-1 flex-wrap pl-6 border-l">
            <h1 style={{ color: "#333333", fontSize: "1.5rem" }}>
              Class: {classCode}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: "#1C2C5B" }} />
                <span style={{ color: "#333333", opacity: 0.7 }}>
                  {students.length} students
                </span>
              </div>
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
                    className="truncate mr-2 text-sm"
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
              {/* 🔹 CREATE CHALLENGE BUTTON */}
                <button
                  onClick={() => setChallengeOpen(true)}
                  className="w-full mt-4 py-3 rounded-full bg-[#1C2C5B] text-white font-semibold">
                  <span style={{ filter: "brightness(0) invert(1)" }}>➕</span> Create Challenge
                </button>
            </div>
          </motion.div>
          {/* ------------------ Single Challenge Card with Student Reflections ------------------ */}
            <div className="mb-6 mt-6">
              
                 {/* Section 2: Students List */}    
           <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl mt-5 p-6 bg-white"
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
                <div className="grid sm:grid-cols-1 gap-4 overflow-y-scroll scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[300px]">
                  {students.map((student, index) => (
                    <motion.div
                      key={student.studentId}
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
                          <p className="truncate font-bold" style={{ color: "#333333" }}>
                            {student.nickname}
                          </p>
                          
                        </div>
                        <p style={{ color: "#333333", opacity: 0.5, fontSize: "0.75rem" }}>
                         
                        </p>
                      </div>

                      {/* Points Badge
                      <div
                        className="px-3 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                        style={{ backgroundColor: "#FFF5ED" }}
                      >
                        <Star size={14} style={{ color: "#F78C2B" }} fill="#F78C2B" />
                        <span style={{ color: "#F78C2B", fontSize: "0.875rem" }}>
                          {student.points}
                        </span>
                      </div> */}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            </div>
          
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
        
            <TeacherWeeklyChallenge
              classId={classId}
              onEdit={(challenge, index) => {
                setEditingChallenge({ challenge, index });
                setChallengeOpen(true);
              }}
              onDelete={handleDeleteChallenge}
              onStartChallenge={handleStartChallenge}
              refresh={refresh}
            />
            
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
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {students.map((student, index) => {
                      const rank = index + 1;
                      const isTopThree = rank <= 3;

                      const medal =
                        rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

                      return (
                        <motion.div
                          key={student.studentId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ scale: 1.05 }}
                          className="rounded-2xl p-5 pt-12 text-center relative"
                          style={{
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
                            
                          }}
                        >

                          {/* Student ID Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-0.5 text-xs font-semibold rounded-[5px] bg-[#1C2C5B]/10 text-[#1C2C5B] border border-[#1C2C5B]/20">
                              ID: {student.student_code}
                            </span>
                          </div>
                          {/* Avatar */}
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto  text-lg font-semibold"
                            style={{
                              backgroundColor: getAvatarColor(index),
                              color: "white",
                            }}
                          >
                            {student.initials}
                          </div>

                          {/* Name */}
                          <h4
                            className="mt-4 font-bold truncate"
                            style={{ color: "#333333" }}
                          >
                            {student.nickname}
                          </h4>

                          {/* Points */}
                        {/* Awards & Points Row */}
                          <div
                            className="mt-4 flex items-center justify-between px-4 py-2 rounded-xl"
                            style={{ backgroundColor: "#E7F6F3" }}
                          >
                            {/* Awards */}
                            <div className="flex items-center gap-2 cursor-pointer"
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `${API_BASE_URL}awards/student/${classId}/${student.studentId}`
                                );
                                const data = await res.json();

                                if (!data.success) throw new Error();

                                setPreviewStudent({
                                  ...student,
                                  awards: data.awards, // 👈 REAL award IDs
                                });

                                setPreviewModalOpen(true);
                              } catch {
                                toast.error("Failed to load awards");
                              }
                            }}

                            >
                              <span className="text-lg">🎖️</span>
                              {/* <Award size={20} className="text-[#F78C2B]" /> */}
                              <span
                                className="text-sm font-semibold"
                                style={{ color: "#333333" }}
                              >
                                {student.stars}
                              </span>
                              {/* <span className="text-xs opacity-60">Awards</span> */}
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-1">
                              
                              <span
                                className="text-sm font-semibold"
                                style={{ color: "#333333" }}
                              >
                                {student.points}
                              </span>
                              <span className="text-xs font-medium opacity-70">Points</span>
                            </div>
                          </div>


                      {/* Teacher Actions */}
                      <span className="block mt-4 text-sm font-semibold text-gray-500">Give Awards & Points</span>
                      <div className="mt-2 flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">

                        {/* Award */}
                        <motion.button
                          whileHover={{ backgroundColor: "#FFF0E5" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setActiveStudentId(student.studentId);
                            setAwardModalOpen(true);
                          }}
                          className="flex-1 px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold transition"
                          style={{ color: "#F78C2B" }}
                        >
                          <Award size={16} />
                          Award
                        </motion.button>

                        {/* Divider */}
                        <div className="w-px bg-gray-400 my-2" />

                        {/* Points */}
                        <motion.button
                          whileHover={{ backgroundColor: "#E0F2F1" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => givePoints(student.studentId, student.points, student.stars)}
                          className="flex-1 px-5 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold transition"
                          style={{ color: "#1C2C5B" }}
                        >
                          +1 Point
                        </motion.button>

                      </div>

                        </motion.div>
                      );
                    })}
                  </div>
              )}
            </motion.div>
       

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl p-6 bg-white"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl flex items-center gap-2 font-semibold text-gray-800"><Users size={24} color="#f78c2b" /> Teams</h3>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingTeamId(null);
                      setNewTeamName("");
                      setSelectedTeamMembers([]);
                      setTeamModalOpen(true);
                    }}
                    className="py-2 px-4 rounded-full bg-[#1C2C5B] text-white font-semibold"
                  >
                    + Create New Team
                  </button>
                </div>

                {/* Teams Cards */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {teams.map((team) => {
                  const members = team.members || [];

                  const weeks = members.map(
                    (m: any) => Number(m.challengeWeek) || 0
                  );
                  const maxWeek = weeks.length ? Math.max(...weeks) : 0;

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        setActiveTeam(team);
                        fetchReflections(1, team.id);
                      }}
                      className="rounded-2xl p-5 bg-white border shadow-sm hover:shadow-lg transition cursor-pointer"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {team.name}
                        </h4>

                        <span className="px-3 flex items-center gap-1 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <User size={14} /> {members.length}
                        </span>
                      </div>

                      {/* MEMBER AVATARS */}
                      <div className="flex items-center mb-4">
                        {members.length === 0 ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              ?
                            </div>
                            Empty team
                          </div>
                        ) : (
                          <div className="flex -space-x-3">
                            {members.map((student: any, idx: number) => (
                              <div
                                key={student.id}
                                title={student.nickname}
                                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold text-sm shadow"
                                style={{ backgroundColor: getAvatarColor(idx) }}
                              >
                                {student.initials}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                          {/* Edit */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTeam(team);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                              title="Edit Team"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTeamId(team.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                              title="Delete Team"
                            >
                              <Trash2 size={16} />
                            </button>  
                      {/* WEEK PROGRESS */}
                      <div className="rounded-xl bg-[#F9FAFB] p-3 border flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">
                          Progress
                        </div>

                        {maxWeek === 0 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                            ⏳ Not Started
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            📅 Week {maxWeek}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}



                </div>
              </motion.div>

                 {/* Delete Modal */}
      <AnimatePresence>
        {deleteTeamId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-96 relative"
            >
              <button
                onClick={() => setDeleteTeamId(null)}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h3 className="text-xl font-semibold mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this team?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTeamId(null)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTeam(deleteTeamId)}
                  className="flex-1 bg-[#1C2C5B] text-white rounded-xl py-2"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

                {teamModalOpen && (
                    <motion.div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setTeamModalOpen(false)}
                    >
                      <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"> <Users size={20} color="#f78c2b" /> {isEditMode ? "Edit Team" : "Create New Team"}</h3>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Team Name</label>
                          <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-[#1C2C5B]"
                            placeholder="Enter team name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Select Students
                          </label>

                          <div className="flex flex-wrap gap-2">
                            
                            {listStuidents.map((s) => (
                              <button
  key={s.studentId}
  onClick={() =>
    setSelectedTeamMembers((prev) =>
      prev.includes(s.studentId)
        ? prev.filter((id) => id !== s.studentId)
        : [...prev, s.studentId]
    )
  }
  className={`relative px-3 py-1 rounded-full text-sm font-medium border transition ${
    selectedTeamMembers.includes(s.studentId)
      ? "bg-[#1C2C5B] text-white border-[#1C2C5B]"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
  }`}
>
  {s.nickname}

  {selectedTeamMembers.includes(s.studentId) && (
    <span className="absolute -top-1 -right-1 bg-white text-[#1C2C5B] rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow">
      ✕
    </span>
  )}
</button>

                            ))}

                          </div>
                        </div>


                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => setTeamModalOpen(false)}
                            className="flex-1 py-3 rounded-full text-sm font-semibold bg-gray-200 text-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                        onClick={isEditMode ? handleUpdateTeam : handleCreateTeam}
                        className="flex-1 py-3 rounded-full text-sm font-semibold text-white bg-[#1C2C5B]"
                      >
                        {isEditMode ? "Update Team" : "Create Team"}
                      </button>
                        </div>
                      </motion.div>
                    </motion.div>
                )}

                {/* Team Modal */}
                  {activeTeam && (
                    <motion.div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
                      >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-[#1C2C5B] to-[#2f4aa0] text-white p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                  <Users size={24} color="#f78c2b" />
                                  {activeTeam.name}
                                </h3>

                                {/* TEAM PROGRESS */}
                                {(() => {
                                  const weeks = activeTeam.members.map(
                                    (m: any) => Number(m.challengeWeek) || 0
                                  );
                                  const maxWeek = weeks.length ? Math.max(...weeks) : 0;

                                  return (
                                    <div className="inline-flex px-4 py-1 rounded-full bg-[#f78c2b2b] text-xs font-semibold">
                                      {maxWeek === 0 ? "⏳ Not Started" : `📅 Week ${maxWeek}`}
                                    </div>
                                  );
                                })()}
                              </div>

                              <p className="opacity-80 text-sm mt-1">
                                Team challenge members
                              </p>
                            </div>

                            <button
                              onClick={() => setActiveTeam(null)}
                              className="text-white text-xl font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* BODY */}
                        <div className="p-6 space-y-6">
                          {/* MEMBERS GRID */}
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-4">
                              Team Members
                            </h4>

                            <div className="grid sm:grid-cols-2 gap-4">
                              {activeTeam.members.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                  No students in this team
                                </p>
                              ) : (
                                activeTeam.members.map((student: any, index: number) => {
                                  const weekNum = Number(student.challengeWeek) || 0;
                                  const started = weekNum > 0;

                                  return (
                                    <motion.div
                                      key={student.id}
                                      whileHover={{ scale: 1.02 }}
                                      className="rounded-2xl p-4 border bg-[#F9FAFB]"
                                    >
                                      <div className="flex items-center gap-3 mb-3">
                                        <div
                                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                                          style={{
                                            backgroundColor: getAvatarColor(index),
                                          }}
                                        >
                                          {student.initials}
                                        </div>

                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-800">
                                            {student.nickname}
                                          </p>

                                          {started ? (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-semibold">
                                              Week {weekNum}
                                            </span>
                                          ) : (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 font-semibold">
                                              Not Started
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                          {activeTeam?.members?.length > 0 && (  
                          <div className="bg-white rounded-2xl shadow-md p-6 mx-auto">
                              <div className="flex justify-between items-center mb-4">
                              {/* Challenge Info */}
                              <h4 className="text-lg" style={{ color: "#333333" }}>
                                Weekly Reflections
                              </h4>
                              <select
                                value={selectedWeek}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === "all" ? "all" : parseInt(e.target.value);

                                  setSelectedWeek(value);
                                  fetchReflections(value,activeTeam.id); // 👈 call on change
                                }}
                                className="border rounded-[5px] p-2 text-sm outline-none"
                              >

                                {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => (
                                  <option key={week} value={week}>
                                    Week {week}
                                  </option>
                                ))}
                              </select>
                              </div>
                              {/* <p className="text-sm text-gray-600 mt-1">
                                Students must complete 15 minutes of focused reading every day.
                              </p> */}

                              {/* Students Reflections List */}
                              <div className="mt-4 border-t pt-4 space-y-4 overflow-y-auto scrollbar-hide max-h-[350px]">
                                {/* Show Title & Selected Option ONCE (Optional) */}
                                {(reflections?.length > 0) && (
                                  <div className="">
                                    
                                    {/* Title (optional) */}
                                    {reflections[0]?.title && (
                                      <h3 className="text-sm" style={{ color: "#333333" }}>
                                        <span className="text-orange-600">Title:</span> {reflections[0].title}
                                      </h3>
                                    )}

                                    {/* Selected Option (optional) */}
                                    {reflections[0]?.selected_option && (
                                      <p className="text-sm mt-1">
                                      <span className="text-orange-600">Selected Option:</span> <span>{reflections[0].selected_option}</span>
                                      </p>
                                    )}

                                  </div>
                                )}    

                              {/* Reflection List */}
                              {reflections.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  No reflection submitted yet!
                                </p>
                              ) : (
                                reflections.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="flex justify-between items-start gap-3">
                                      
                                      {/* Left Section */}
                                      <div className="flex gap-3 flex-1">
                                        
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                          {getInitials(item.studentName)}
                                        </div>

                                        {/* Student Info */}
                                        <div className="flex-1 min-w-0">
                                          
                                          <p className="font-semibold text-gray-800">
                                            {item.studentName}
                                          </p>

                                          <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                                            <span>{item.emoji}</span>
                                            <span className="">
                                              {item.text}
                                            </span>
                                          </p>

                                        </div>
                                      </div>

                                      {/* Date */}
                                      <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {item.date}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}

                              </div>


                              <div>

                              </div>

                          </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}


          </div>
        </div>
      </div>

       {/* Awards modal */}        
            {awardModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-xl rounded-3xl p-6 bg-white"
                  style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
                >
                  {/* Header */}
                  <div className="mb-6 text-center">
                    <h3
                      className="text-xl font-semibold"
                      style={{ color: "#333333" }}
                    >
                      Give an Award
                    </h3>
                    <p className="text-sm mt-1 opacity-70">
                      Choose a behaviour to celebrate
                    </p>
                  </div>
      
                  {/* Awards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {AWARDS.map((award) => {
                      const isSelected = selectedAwards.includes(award.id);
      
                      return (
                        <motion.button
                          key={award.id}
                          onClick={() => toggleAward(award.id)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className="relative p-4 rounded-2xl border text-center transition-all"
                          style={{
                            borderColor: isSelected ? award.color : "#E5E7EB",
                            backgroundColor: isSelected ? award.color + "11" : "#fff",
                          }}
                        >
                          {/* Selected indicator */}
                          {isSelected && (
                            <div
                              className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: award.color }}
                            >
                              ✓
                            </div>
                          )}
      
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                            style={{ backgroundColor: award.color + "22" }}
                          >
                            {award.icon}
                          </div>
      
                          {/* Label */}
                          <p className="text-sm font-semibold text-gray-700">
                            {award.name}
                          </p>
                        </motion.button>
                      );
                    })}
      
                  </div>
      
                  {/* Footer */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedAwards([]);
                        setActiveStudentId(null);
                        setAwardModalOpen(false);
                      }}
                      className="flex-1 py-3 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "#E5E7EB", color: "#333333" }}
                    >
                      Cancel
                    </button>
      
                      <button
                        disabled={selectedAwards.length === 0}
                        className="flex-1 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: "#1C2C5B" }}
                        onClick={() =>activeStudentId && giveAwardsToStudent(activeStudentId, selectedAwards)}
      
                      >
                        Give {selectedAwards.length} Award
                      </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Awards Preview Modal */}
            {previewModalOpen && previewStudent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                onClick={() => setPreviewModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-xl rounded-3xl p-6 bg-white"
                  style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
                  onClick={(e) => e.stopPropagation()} // prevent modal close on content click
                >
                  <h3 className="text-xl font-semibold mb-4" style={{ color: "#333333" }}>
                    {previewStudent.nickname}'s Awards
                  </h3>
            
                  {!previewStudent.awards || previewStudent.awards.length === 0 ? (
                    <p className="text-sm text-gray-500">No awards yet</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                      {previewStudent.awards.map((awardId) => {
                        const award = AWARDS.find((a) => a.id === awardId);
                        if (!award) return null;
            
                        return (
                          <div
                            key={award.id}
                            className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                            style={{ backgroundColor: award.color + "11", color: award.color }}
                          >
                            <div className="w-12 h-12 text-xl rounded-full flex items-center justify-center mb-3 mx-auto"
                                  style={{ backgroundColor: award.color + "22" }}>
                              {typeof award.icon === "string" ? award.icon : award.icon}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{award.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
            
                  <button
                    className="mt-6 w-full py-3 rounded-full font-semibold text-white"
                    style={{ backgroundColor: "#1C2C5B" }}
                    onClick={() => setPreviewModalOpen(false)}
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
            {/* Modal */}
            <TeacherChallengeModal
              open={challengeOpen}
              onClose={() => { setChallengeOpen(false); setEditingChallenge(undefined); }}
              onCreate={(newChallenge) => {
                setChallenges(prev => [...prev, newChallenge]);
                setChallengeOpen(false);
              }}
              onEdit={(updatedChallenge, index) => {
                setChallenges(prev => prev.map((c, i) => i === index ? updatedChallenge : c));
                setChallengeOpen(false);
              }}
              editData={editingChallenge}
              classId={classId}
              onRefresh={() => setRefresh(prev => prev + 1)}
            />
          </div>
  );
}
