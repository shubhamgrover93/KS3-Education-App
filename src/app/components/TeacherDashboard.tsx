import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Copy,
  Check,
  ArrowRight,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/* =========================
   TYPES
========================= */
interface TeacherDashboardProps {
  onBack?: () => void;
  onGoToClass?: (classCode: string) => void;
}

interface TeacherClassInfo {
  code: string;
  createdDate: string; // e.g. "Jan 30, 2026"
}

/* =========================
   COMPONENT
========================= */
export default function TeacherDashboard({
  onBack,
  onGoToClass,
}: TeacherDashboardProps) {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const DOMAIN_URL = import.meta.env.VITE_APP_DOMAIN;

  const [classes, setClasses] = useState<TeacherClassInfo[]>([]);
  const [selectedClass, setSelectedClass] =
    useState<TeacherClassInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  /* =========================
     FETCH CLASSES
  ========================== */
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}class/list`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load classes");
        return;
      }

      setClasses(
        data.classes.map((cls: any) => ({
          code: cls.class_code,
          createdDate: cls.createdDate,
        }))
      );
    } catch {
      toast.error("Unable to fetch classes");
    }
  };

  /* =========================
     CREATE CLASS
  ========================== */
  const generateClassCode = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}class/start`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to create class");
        return;
      }

      const newClass = {
        code: data.classCode,
        createdDate: data.createdDate || "Today",
      };

      setClasses((prev) => [newClass, ...prev]);
      setSelectedClass(newClass);

      toast.success("Class created successfully 🎉");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     COPY HELPERS
  ========================== */
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


  const joinUrl = useMemo(
    () => (selectedClass ? `${DOMAIN_URL}join/${selectedClass.code}` : ""),
    [selectedClass, DOMAIN_URL]
  );

  /* =========================
     UI
  ========================== */
  return (
    <div className="min-h-screen p-6 bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white hover:shadow-md"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          <h1 className="md:text-4xl text-2xl">👩‍🏫 Teacher Classes</h1>
          <p className="opacity-70 mt-2">
            You created {classes.length} classes
          </p>
        </motion.div>
      
        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Generate Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={generateClassCode}
            className="rounded-3xl p-6 bg-white cursor-pointer border-2 border-dashed border-[#F78C2B] flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#FFF5ED] flex items-center justify-center mb-4">
              <Plus size={32} color="#F78C2B" />
            </div>
            <h3 className="text-lg font-semibold text-[#F78C2B]">
              {loading ? "Creating..." : "Generate Class"}
            </h3>
          </motion.div>
          {classes.map((cls, index) => (
            <motion.div
              key={cls.code}
              whileHover={{ y: -4, scale: 1.02 }}
              className="rounded-3xl p-6 bg-white shadow-md"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: index % 2 === 0 ? "#F78C2B" : "#1C2C5B",
                }}
              >
                <BookOpen size={28} color="white" />
              </div>

              <h3 className="text-xl font-semibold">Class {cls.code}</h3>
              <p className="text-sm opacity-60 mb-4">
                Created {cls.createdDate}
              </p>

              <button
                onClick={() => navigate(`class/${cls.code}`)}
                className="w-full py-4 rounded-2xl bg-[#1C2C5B] text-white flex items-center justify-center gap-2"
              >
                <Users size={20} /> Go to Class
              </button>
            </motion.div>
          ))}

          
        </div>
      </div>

      {/* Modal */}
      {selectedClass && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedClass(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                🎉 Class Created Successfully!
              </h2>
              <button onClick={() => setSelectedClass(null)}>
                <X />
              </button>
            </div>

            {/* Code */}
            <div className="mb-4">
              <label>Your Class Code</label>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-[#FFF5ED] border-2 border-[#F78C2B]">
                <span className="text-3xl tracking-widest">
                  {selectedClass.code}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(selectedClass.code, "code")
                  }
                  className="p-3 rounded-xl text-white"
                  style={{
                    backgroundColor: copiedCode ? "#1C2C5B" : "#F78C2B",
                  }}
                >
                  {copiedCode ? <Check /> : <Copy />}
                </button>
              </div>
            </div>

            {/* URL */}
            <div className="mb-4">
              <label>Join URL</label>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-[#F0F9F8] border-2 border-[#1C2C5B]">
                <span className="truncate mr-4">{joinUrl}</span>
                <button
                  onClick={() => copyToClipboard(joinUrl, "url")}
                  className="p-3 rounded-xl text-white bg-[#1C2C5B]"
                >
                  {copiedUrl ? <Check /> : <Copy />}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`class/${selectedClass.code}`)}
              className="w-full py-4 rounded-2xl bg-[#1C2C5B] text-white flex items-center justify-center gap-2"
            >
              Go to Class Dashboard <ArrowRight />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
