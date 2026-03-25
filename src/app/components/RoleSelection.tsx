import { motion } from "motion/react";
import { ClipboardList, Sparkles, User, GraduationCap, BookOpen, Camera, Lightbulb , Users } from "lucide-react";
import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
interface RoleSelectionProps {
  onSelectRole: (role: "teacher" | "student") => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: "#F5F5F5" }}
    >
      <div className="w-full max-w-5xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="mb-1 flex justify-center items-center gap-2" style={{ fontSize: '2.5rem', color: '#333333' }}>
            <img src={Logo} className="md:max-w-72 max-w-44" alt="" />
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#1C2C5B' }}>KS3 Learning Platform</p>
        </motion.div>
        {/* <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
          <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="w-8 h-8 text-[#FCD34D]" />
          <h1 className="text-4xl md:text-5xl font-bold text-[#2D3748]">My BreadnButter</h1>
          <Sparkles className="w-8 h-8 text-[#FCD34D]" />
        </div>
        <p className="text-xl md:text-2xl text-[#6B7280]">KS3 Creator Journey</p>
        </motion.div> */}
        {/* Top Banner */}
         <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full mb-8"
        >
          <div
            className="rounded-[1rem] px-6 py-8 text-center"
            style={{
              background: "linear-gradient(177deg, #1C2C5B, #627bc6)",
              color: "white",
            }}
          >

            <div className="flex justify-center mb-2">
              <div
                className="w-16 h-16 rounded-full border border-white flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              >
                <GraduationCap size={32} />
              </div>
            </div>


            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
             Creator Quest
            </h1>

            <p
              className="mt-1"
              style={{
                fontSize: "1rem",
                opacity: 0.95,
              }}
            >
              KS3 Creator Journey
            </p>
          </div>
        </motion.div>


        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* STUDENT CARD */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole("student")}
            className="cursor-pointer rounded-3xl p-10 bg-white"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "3px solid #1C2C5B",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: "#1C2C5B" }}
            >
              <div className="relative">
                {/* <GraduationCap size={40} color="white" /> */}
                <Lightbulb  size={36} color="white" />
                
              </div>
            </div>

            <h2
              className="text-center mb-3"
              style={{ color: "#333333", fontSize: "2rem" }}
            >
              Join Your Class
            </h2>

            <p
              className="text-center mb-8"
              style={{ color: "#333333", opacity: 0.7 }}
            >
              Work with Ella, Ethan & Jamie as you create, reflect, and grow
              together.
            </p>

            <button
              className="w-full py-4 rounded-2xl flex items-center gap-4 justify-center transition-all hover:shadow-lg"
              onClick={() => navigate("student")}
              style={{
                backgroundColor: "#1C2C5B",
                color: "white",
                fontSize: "1.125rem",
              }}
            >
             
             <div className="relative">
              <User size={24} color="white" />
                <Sparkles
                  size={12}
                  color="white"
                  className="absolute -top-1 -right-2"
                />
                </div>
             
              Join Your Class
            </button>
          </motion.div>

          {/* TEACHER CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole("teacher")}
            className="cursor-pointer rounded-3xl p-10 bg-white"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "3px solid #F78C2B",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: "#F78C2B" }}
            >
              {/* <BookOpen size={40} color="white" /> */}
              <Users size={36} color="white" />
            </div>

            <h2
              className="text-center mb-3"
              style={{ color: "#333333", fontSize: "2rem" }}
            >
              Teacher Area
            </h2>

            <p
              className="text-center mb-8"
              style={{ color: "#333333", opacity: 0.7 }}
            >
              Create a class, share the join code, and support creative learning.
            </p>

            <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            onClick={() => navigate("teacher")}
              style={{
                backgroundColor: "#F78C2B",
                color: "white",
                fontSize: "1.125rem",
              }}
            >
               <ClipboardList size={24} color="white" />
               
                Go to Teacher Area
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
