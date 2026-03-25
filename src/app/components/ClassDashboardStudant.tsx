import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { User, Copy, Check, ArrowLeft, Users, Star, Trophy, TrendingUp, Plus, } from "lucide-react";
import MeetTheTeam from "./MeetTheTeam"
import { weeklyJourney, characterBios } from '../../app/data/journeyData';
import { io, Socket } from "socket.io-client";
import { useRef } from "react";
import MannersIcon from "./../../assets/microphone_manners.svg"
import CreativeJourney from "./CreativeJourney"
import StudentWeeklyChallenge from "./StudentWeeklyChallenge";
import StudentChallengeModal from "./StudentChallengeModal";
import StudentReflectionModal from "./StudentReflectionModal";


interface ClassDashboardProps {
  nickname: string;
  onBack: () => void;
  onShowAll: () => void;
}
interface Student {
  studentId: number;
  nickname: string;
  student_code:string,
  initials: string;
  points: number;
  stars: number;
  reflectionsCount:number;
  awards?: string[];
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
interface Team {
  id: number;
  name: string;
  memberIds: string[]; // store student IDs
  progress: string; // Week 1, Week 2, Not Started
}
export default function ClassDashboardStudant({ nickname, onBack, onShowAll }: ClassDashboardProps) {

  const socketRef = useRef<Socket | null>(null);
  const params = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [scoreboard, setScoreboard] = useState<Student[]>([]);
  const [classId, setclassId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [classCode, setClassCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewReflectionModalOpen, setPreviewReflectionModalOpen] = useState(false);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [previewReflections, setPreviewReflections] = useState(null);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN;
  const [studentName, setStudentName] = useState("");
  const [studentStoredId, setStudentId] = useState("");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentChallangeResponseWeek, setCurrentChallangeResponseWeek] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  type ChallengeStep = "intro" | "week" | "options" | "reflection" | "completed"
  
  const [selectedWeek, setSelectedWeek] = useState<number | "all">(1);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [challengeStep, setChallengeStep] = useState<ChallengeStep>("intro")
  const [reflectionStep, setReflectionStep] = useState<ChallengeStep>("intro")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [reflection, setReflection] = useState("");
  const [teamId, setTeamId] = useState("");
  const [reflections, setReflections] = useState([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [currentChallengeResponse, setCurrentChallengeResponse] =
    useState(null);

  const handleStartChallenge = () => {
    setChallengeOpen(true)
    setChallengeStep("intro")
    setReflectionStep("intro")
  }
    const handleStartReflection = () => {
    setReflectionOpen(true)
  }


  const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
    
  useEffect(() => {
  //   const storedName = localStorage.getItem("studentNickname");
  //   const studentStoredId = localStorage.getItem("studentId");
  //   if (storedName) {
  //     // setStudentName(storedName);
  //     // setStudentId(studentStoredId);
  //   }else{
  //   navigate(`/`);
  //  }
    
    if (params.code) {
      const code = params.code.toUpperCase();
      const studentCode = params.studentCode.toUpperCase();
      setStudentCode(studentCode);
      setClassCode(code);
      fetchScoreboard(code);
      fetchStudent(studentCode);
      
      
    }
  }, [params.code,classId, refresh]);
 const fetchScoreboard = async (code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}class/${code}/scoreboard`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setScoreboard(data.scoreboard); // already sorted by points from backend
        setclassId(data.class.classId);
        
       
      } else {
        toast.error(data.message || "Failed to fetch class data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching class data");
    }
  };
    const fetchChallenge = async (currentWeek) => {
    try {
    
        const res = await fetch(
          `${API_BASE_URL}weekly-challenges/${classId}?week=${currentWeek}`
        );

        const data = await res.json();

        if (data.success && data.data) {
          
          setCurrentChallenge(data.data[0]);
          setChallengeId(data.data[0].id);
          setOptions(data.data[0].options || []);
        } else {
          setCurrentChallenge(null);
        }
      } catch (error) {
        console.error("Failed to load weekly challenge", error);
        setCurrentChallenge(null);
      }
    };

  const fetchStudent = async (studentCode: string) => {
        fetch(`${API_BASE_URL}student/detail/${studentCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           setStudentName(data.data.nickname);
           setStudentId(data.data.studentId);
           fetchTeams(data.data.studentId);
        }
      })
      .catch(() =>
          console.log("Failed to load teams")
    );
  };
  
  const fetchTeams = async (studentId: number) => {

        fetch(`${API_BASE_URL}teams/class/${classId}/${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTeams(data.data);
          if(data.data.length > 0)
           setTeamId(data.data[0]['id']); 
          setCurrentWeek(data.currentWeek)
          fetchChallenge(data.currentWeek);
          fetchWeeklyResponse(data.data[0]['id'],data.currentWeek);
          fetchReflection(studentId,data.currentWeek);
        }
      })
      .catch(() =>
          console.log("Failed to load teams")
    );
  };

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
 const fetchReflection = async (studentId, week) => {
    try {
    
         const res = await fetch(
            `${API_BASE_URL}reflection/studentHistory/${studentId}/${classId}/${week}`
          );

        const data = await res.json();

        if (data.data) {
          
          setPreviewReflections(data.data|| []);
          
        } else {
          setPreviewReflections(null);
        }
      } catch (error) {
        console.error("Failed to load weekly reflection", error);
        setPreviewReflections(null);
      }
    };
   const fetchWeeklyResponse = async (teamId, currentWeek) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}weekly-student-challenges/${classId}/${teamId}/responses?week=${currentWeek}`
      );

      const data = await res.json();

      if (data.success && data.data?.length) {
        const response = data.data[0];

        setCurrentChallengeResponse(response);
        setCurrentChallangeResponseWeek(response.week);
        
      } else {
        setCurrentChallengeResponse(null);
        setCurrentChallangeResponseWeek(0);
      }
    } catch (error) {
      console.error("Failed to load weekly challenge", error);
      setCurrentChallenge(null);
    }
  };

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

    //toast.success(`${student.nickname} joined the class 🎉`); return;
  });

  socket.on("disconnect", () => {
    console.log("Teacher disconnected");
  });

  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
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

  
  const joinUrl = `${DOMAIN_URL}student/class/${classCode}/${studentCode}`;

  const getAvatarColor = (index: number) => {
    const colors = ["#F78C2B", "#1C2C5B", "#E76F51", "#8AB4F8", "#F4A5D7"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap gap-4 justify-between"
        >
          <button
            onClick={() => navigate("/student")}
            className="md:w-auto w-full flex items-center gap-2 text-sm px-4 py-[12px] rounded-xl transition-all hover:shadow-md"
            style={{ backgroundColor: "white", color: "#333333", }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/student")}
              className="md:w-auto w-full flex items-center justify-center text-sm gap-2 px-6 py-[12px] rounded-xl transition-all hover:shadow-lg"
              style={{
                backgroundColor: '#1C2C5B',
                color: 'white',
                
              }}
            >
              <Plus size={20} />
              Join Another Class
            </motion.button>
            
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 justify-between items-center text-left mb-8"
        >
          <div className="">
            <h1 className="text-4xl font-bold text-[#2D3748] mb-2">
              Welcome to the Creator Team 👋
            </h1>

            <p className="text-xl text-[#6B7280]">
              Hey {studentName}, ready for today's creative challenge?
            </p>
          </div>
          <div
                  className="md:w-auto w-full rounded-2xl p-4 flex items-center justify-between"
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
        </motion.div>

        {/* Character Introduction */}
        
{/* Character Introduction */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>

  <div
    className="rounded-3xl p-8 mb-8"
    style={{
      backgroundColor: "#FFFFFF",
      boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
    }}
  >
    {/* Section Header */}
    <h2
      className="md:text-2xl text-xl mb-8 flex md:items-center items-start gap-3"
      style={{ color: "#333333" }}
    >
      <Users className="w-6 h-6" style={{ color: "#1C2C5B" }} />
      Meet Your Creator Team
    </h2>

    {/* Cards */}
    <MeetTheTeam />
  </div>
</motion.div>
{/* Section 3: Student Weekly Dashboiard */}
<StudentWeeklyChallenge
  classId={classId}
  currentWeek={currentWeek}
  showReflection={showReflection}
  currentResponseWeek={currentChallangeResponseWeek}
  onStartChallenge={handleStartChallenge}
  onStartReflection={handleStartReflection}
  currentChallenge= {currentChallenge}
  currentReflection={previewReflections}
  refresh={refresh}
  teams= {teams}
/>

<StudentChallengeModal
  open={challengeOpen}
  onClose={() => setChallengeOpen(false)}
  step={challengeStep}
  setStep={setChallengeStep}
  selectedOption={selectedOption}
  setSelectedOption={setSelectedOption}
  reflection={reflection}
  setReflection={setReflection}
  options={options}
  challengeId= {challengeId}
  classId={classId}
  studentId={studentStoredId}
  onRefresh={() => setRefresh(prev => prev + 1)}
  currentWeek={currentWeek}
/>
<StudentReflectionModal
  open={reflectionOpen}
  onClose={() => setReflectionOpen(false)}
  step={challengeStep}
  setStep={setReflectionStep}
  selectedOption={selectedOption}
  setSelectedOption={setSelectedOption}
  reflection={reflection}
  setReflection={setReflection}
  options={options}
  challengeId= {challengeId}
  classId={classId}
  studentId={studentStoredId}
  onRefresh={() => setRefresh(prev => prev + 1)}
  currentWeek={currentWeek}
  currentChallenge= {currentChallenge}
/>
<CreativeJourney currentWeek={currentWeek} teamId={teamId} classId={classId} studentId={studentStoredId} currentReflection={previewReflections} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Section 1: Class Sharing Panel */}
          <div className="">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 mb-6"
          >
            <div
              className="rounded-3xl p-6 bg-white sticky top-6"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              <h3 className="mb-6 flex items-center gap-2" style={{ color: "#333333", fontSize: "1.5rem" }}>
                🔑 Class Joined
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
              {/* <div className="mb-6">
                <label className="block mb-3" style={{ color: "#333333", fontSize: "0.875rem" }}>
                  Class URL
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
              </div> */}

            </div>
            
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2" style={{ color: "#333333", fontSize: "1.5rem" }}>
                 <User size={24} style={{ color: '#F78C2B', opacity: 1 }} /> Students in class
                </h3>
                <span
                  className="px-4 py-2 rounded-full"
                  style={{ backgroundColor: "#E7F6F3", color: "#1C2C5B", fontSize: "0.875rem" }}
                >
                  {students.length} 
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
                <div className="grid gap-4 overflow-y-scroll scrollbar-hide [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-h-[300px]">
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
                        {/* <p style={{ color: "#333333", opacity: 0.5, fontSize: "0.75rem" }}>
                          {student.status === "online" ? "Active now" : "Offline"}
                        </p> */}
                      </div>

                      {/* Points Badge */}
                      {/* <div
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

          {/* Right Column: Students & Scoreboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 2: Students List */}
            {/* Welcome Message */}

            {/* Section 3: Student Scoreboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}
            >
              {/* <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#14B8A6] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#14B8A6] text-white rounded-full text-sm">
                      Week 1
                    </span>
                  </div>
                  <h2 className="text-3xl mb-3 text-[#2D3748]">Weekly Challenges!</h2>
                </div>
              </div>

                <div className="flex flex-col items-center justify-center text-center my-auto">
                  <div className="w-20 h-20 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                    <span className="text-2xl text-[#94A3B8]">TBD</span>
                  </div>

                  <p className="text-sm text-[#9CA3AF] max-w-sm">
                    Once available, weekly challenges will appear here for students to explore and reflect on.
                  </p>  
                </div> */}
              <h3 className="flex items-center gap-2 mb-6" style={{ color: "rgb(38, 70, 83)", fontSize: "1.5rem" }}>🏆 Class Leaderboard</h3>
               {students.length === 0 ? (
                <div className="text-center py-12 my-auto">
                  <Trophy size={48} style={{ color: "#333333", opacity: 0.2, margin: "0 auto 1rem" }} />
                  <p style={{ color: "#333333", opacity: 0.6 }}>

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
                          {/* <div className="border-t mt-4 cursor-pointer pt-3 flex justify-between items-center"
                           onClick={async () => {
                            try {
                              const res = await fetch(
                                `${API_BASE_URL}reflection/studentHistory/${student.studentId}/${classId}/${currentWeek}`
                              );
                              const data = await res.json();

                              setPreviewStudent(student);              // REQUIRED
                              setPreviewReflections(data.data|| []);  // ONLY ARRAY
                              setPreviewReflectionModalOpen(true);
                            } catch (err) {
                              toast.error("Failed to load reflections");
                            }
                          }}

                          >
                            <span>Reflections:</span> {student.reflectionsCount ?? 0}
                          </div> */}
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
            

          </div>
        </div>

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

       {/* Reflections Preview Modal */}
        {previewReflectionModalOpen && previewStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={() => setPreviewReflectionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl rounded-3xl p-6 bg-white"
              style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {previewStudent.nickname}'s Reflections
              </h3>

              {previewReflections.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No reflections yet
                </p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {previewReflections.map((reflection, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div>
                        <h3>{reflection.title}</h3> 
                        </div>
                        <div className="mt-2">
                        <b>Selected Option:</b>  {reflection.selected_option}
                        </div>
                      <div className="flex items-center gap-3 mb-2 mt-3">
                        
                        <span className="text-2xl">{reflection.emoji}</span>
                        <span className="text-base text-gray-400">
                          Week of {reflection.date}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {reflection.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="mt-6 w-full py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: "#1C2C5B" }}
                onClick={() => setPreviewReflectionModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}


      </div>
    </div>
  );
}
