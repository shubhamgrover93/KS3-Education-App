import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import RoleSelection from "./components/RoleSelection";
import TeacherDashboard from "./components/TeacherDashboard";
import ClassDashboard from "./components/ClassDashboard";
import ClassDashboardStudant from "./components/ClassDashboardStudant";
import StudentJoin from "./components/StudentJoin";
import StudentClasses from "./components/StudentClasses";

type Screen = "role-selection" | "teacher" | "class-dashboard" | "class-dashboard-studant" | "student-join" | "student-classes";

interface ClassInfo {
  code: string;
  nickname: string;
  teacherName: string;
  joinedAt: Date;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("role-selection");
  const [studentClasses, setStudentClasses] = useState<ClassInfo[]>([]);
  const [currentClassCode, setCurrentClassCode] = useState<string>("");

  const handleSelectRole = (role: "teacher" | "student") => {
    if (role === "teacher") {
      setCurrentScreen("teacher");
    } else {
    setCurrentScreen(
      "student-join"
    );
    }
  };

  const handleJoinClass = (nickname: string, classCode: string, teacherName: string) => {
    const newClass: ClassInfo = {
      code: classCode,
      nickname: nickname,
      teacherName,
      joinedAt: new Date(),
    };
    setStudentClasses((prev) => {
      if (prev.some((c) => c.code === classCode)) return prev;
      return [...prev, newClass];
    });
    setCurrentClassCode(classCode);
    setCurrentScreen("class-dashboard-studant");
  };

  const handleBackToHome = () => {
    setCurrentScreen("role-selection");
  };

  const handleJoinAnother = () => {
    setCurrentScreen("student-join");
  };

  const handleGoToClass = (classCode: string) => {
    setCurrentClassCode(classCode);
    setCurrentScreen("class-dashboard");
  };

  const handleGoToClassStudant = (classCode: string) => {
    setCurrentClassCode(classCode);
    setCurrentScreen("class-dashboard-studant");
  };

  const handleGoToClasses = (classCode: string) => {
    setCurrentClassCode(classCode);
    setCurrentScreen("student-classes");
  };

  const handleBackToTeacher = () => {
    setCurrentScreen("teacher");
  };
  

  return (
    <>
      <div className="size-full">
       <Routes>
        <Route path="/" element={
          <RoleSelection onSelectRole={handleSelectRole} />
        } 
          />

        <Route path="/teacher" element={
          <TeacherDashboard
            onBack={() => navigate("/")}
            onGoToClass={(code) => navigate(`/class/${code}`)}
          />
        } />
        <Route path="/student" element={
           <StudentJoin onBack={handleBackToHome} onJoinClass={(nickname, classCode, ) => {
              handleJoinClass(nickname, classCode);
              setCurrentClassCode(classCode);
              setCurrentScreen("class-dashboard-studant");
            }} />
        } />
        <Route path="/teacher/class/:code" element={
          <ClassDashboard
            onBack={() => navigate("/teacher")}
          />
        } />
        <Route path="/join/:code" element={
         <StudentJoin onBack={handleBackToHome} onJoinClass={(nickname, classCode, ) => {
            handleJoinClass(nickname, classCode);
            setCurrentClassCode(classCode);
            setCurrentScreen("class-dashboard-studant");
          }} />
        } />
        <Route path="/student/classes" element={
          <StudentClasses
            onBack={() => navigate("/")}
            onJoinAnother={() => navigate("/join")}
            onOpenClass={(code) => navigate(`/student/class/${code}`)}
            classes={[]}
          />
        } />

        {/* ✅ THIS IS YOUR REQUIRED ROUTE */}
        <Route
          path="/join/:classCode"
          element={
            <StudentJoin
              onBack={() => navigate("/")}
              onJoinClass={(nickname, classCode) =>
                navigate(`/student/class/${classCode}`)
              }
            />
          }
        />

        <Route path="/student/class/:code/:studentCode" element={
          <ClassDashboardStudant
            onBack={() => navigate("/student/classes")}
            onShowAll={() => navigate("/student/classes")}
          />
        } />
      </Routes>
      </div>
      <Toaster position="top-center" />

      
    </>

  );
}