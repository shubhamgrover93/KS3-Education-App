import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Props = {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  options: string[];
  challengeId: string;
  classId: string;
  studentId: string;
  currentWeek: string;
  currentChallenge: [];
};

export default function StudentReflectionModal({ open, onClose, options, challengeId, classId, studentId, onRefresh, currentWeek, currentChallenge }: Props) {
  const [step, setStep] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>("");

  // Updated emojis from reflections list
  const emojiReactions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "👍", label: "Good Job" },
    { emoji: "💡", label: "Learned" },
    { emoji: "🎯", label: "Focused" },
    { emoji: "🚀", label: "Excited" },
  ];

  if (!open) return null;
  const handleSubmit = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}reflection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        classId,
        studentId,
        challengeId,
        currentWeek,
        text: reflectionText,
        emoji: selectedEmoji,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setStep(4);        // move to success step
      toast.success(data.message);
      onRefresh();
      setSelectedEmoji("");
      setReflectionText("");
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    console.error("Submit failed", err);
  }
};



  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full max-w-lg rounded-2xl p-6 relative shadow-xl"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          
           {/* HEADER */}
                  <h3 className="text-xl font-semibold text-[#333] mb-4">
                    🎯 Week {currentWeek} Challenge
                  </h3>

                  {/* ========= CHALLENGE INFO ========= */}
                  <div className="bg-[#F2F4F8] rounded-2xl p-6 border mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1C2C5B] flex items-center justify-center text-white">
                        <Users size={18} />
                      </div>
                      <span className="px-3 py-1 text-xs rounded-full bg-[#1C2C5B] text-white">
                        Week {currentChallenge.week}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      {currentChallenge.title}
                    </h3>
                    <p className="text-sm opacity-70 mb-4">
                      {currentChallenge.sub_title}
                    </p>
                  </div>

                  {/* ========= OPTIONS ========= */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-xl">
                     Selected Options
                    </h4>

                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                        {/* <div className="w-4 h-4 rounded-full border-2 border-[#1C2C5B]" /> */}
                        <span className="text-sm">{currentChallenge.selected_option}</span>
                      </div>

                      
                    </div>
                  </div>

            {step === 1 && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-[#F78C2B]">Reflection</h2>
              <p className="text-gray-600">How did you feel about this challenge?</p>

              {/* Emoji Selection */}
              <div className="flex justify-center gap-2">
                {emojiReactions.map((r) => (
                  <div
                    key={r.label}
                    className={`flex flex-col items-center cursor-pointer p-3 rounded-xl transition transform ${
                      selectedEmoji === r.emoji ? "scale-110 bg-[#FFE8CC]" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedEmoji(r.emoji)}
                  >
                    <span className="text-3xl">{r.emoji}</span>
                    <span className="text-sm mt-1">{r.label}</span>
                  </div>
                ))}
              </div>

              {/* Short text input for reflection */}
              <input
                type="text"
                placeholder="What did you learn?"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1C2C5B]"
              />

              <button
                disabled={!selectedEmoji || reflectionText.trim() === ""}
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 bg-[#1C2C5B] hover:bg-[#162656]"
              >
                Save & Complete
              </button>
            </div>
            )}

          {/* STEP 4 - Completed */}
          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle size={48} className="mx-auto text-[#1C2C5B]" />
              <h3 className="text-xl font-bold text-[#1C2C5B]">Reflection Completed 🎉</h3>
              <button
                onClick={() => {
                onClose();
                setStep(1);
                }}
                className="w-full py-3 rounded-xl font-semibold text-white bg-[#1C2C5B] hover:bg-[#162656]"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
