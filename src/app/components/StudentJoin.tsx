import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams  } from "react-router-dom";

interface StudentJoinProps {
  onBack: () => void;
  onJoinClass: (nickname: string, classCode: string) => void;
  onGoToClass: (classCode: string) => void;
}

export default function StudentJoin({ onBack, onJoinClass }: StudentJoinProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [nickname, setNickname] = useState("");
  const [classCode, setClassCode] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN;
  const handleJoinClass = async () => {
  if (!nickname.trim()) {
    toast.error("Please enter your nickname");
    return;
  }

  if (!classCode.trim()) {
    toast.error("Please enter a class code");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}student/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: nickname.trim(),
        classCode: classCode.trim().toUpperCase(),
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      toast.error(data.message || "Failed to join class");
      return;
    }

    toast.success("Successfully joined class! 🎉");
    navigate(`/student/class/${classCode.toUpperCase()}/${data.studentCode.toUpperCase()}`);
    // Optional: move student to class screen
    localStorage.setItem("studentNickname", nickname);
    localStorage.setItem("studentId", data.studentId);
    onJoinClass(nickname, classCode.toUpperCase());

  } catch (error) {
    console.error(error);
    toast.error("Server error. Please try again.");
  }
};

  useEffect(() => {
    if (params.code) {
      setClassCode(params.code.toUpperCase());
    }
  }, [params.classCode]);
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all hover:shadow-md"
            style={{ backgroundColor: 'white', color: '#333333' }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </motion.div>

        {/* Join Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-8 bg-white"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 rounded-full flex border-2 border-[#1C2C5B] items-center justify-center mb-6 mx-auto"
              style={{ backgroundColor: 'rgba(28, 44, 91, 0.49)' }}
            >
              <span style={{ fontSize: '3rem' }}>👨‍🎓</span>
            </div>
            <h2 className="mb-2" style={{ color: '#333333', fontSize: '2rem' }}>
              Join Your Class
            </h2>
            <p style={{ color: '#333333', opacity: 0.7 }}>
              Enter your details to get started
            </p>
          </div>

          <div className="space-y-6">
            {/* Nickname Input */}
            <div>
              <label
                htmlFor="nickname"
                className="block mb-3"
                style={{ color: '#333333' }}
              >
                Your Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Alex"
                className="w-full px-6 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4"
                style={{
                  borderColor: '#1C2C5B',
                  backgroundColor: 'white',
                  color: '#333333',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1C2C5B';
                  e.target.style.boxShadow = '0 0 0 4px rgba(42, 157, 143, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Class Code Input */}
            <div>
              <label
                htmlFor="classCode"
                className="block mb-3"
                style={{ color: '#333333' }}
              >
                Class Code
              </label>
              <input
                id="classCode"
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="w-full px-6 py-4 rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 uppercase"
                style={{
                  borderColor: '#1C2C5B',
                  backgroundColor: 'white',
                  color: '#333333',
                  letterSpacing: '0.1em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1C2C5B';
                  e.target.style.boxShadow = '0 0 0 4px rgba(42, 157, 143, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Join Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinClass}
              // onClick={() => onJoinClass(classCode)}
              className="w-full py-4 rounded-2xl transition-all hover:shadow-lg"
              style={{
                backgroundColor: '#1C2C5B',
                color: 'white',
                fontSize: '1.25rem',
                marginTop: '2rem',
              }}
            >
              Join Class 🚀
            </motion.button>
          </div>

          {/* Help Text */}
          <div
            className="rounded-2xl p-6 mt-6"
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <p style={{ color: '#333333', lineHeight: '1.6', fontSize: '0.875rem' }}>
              💡 <strong>Need help?</strong> Ask your teacher for the class code. It's
              usually 6 characters long and looks like "ABC123".
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
