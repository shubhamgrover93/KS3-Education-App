import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type OptionType = {
  optionName: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  options: OptionType[];
  challengeId: string;
  classId: string;
  studentId: string;
  currentWeek: string;
};

export default function StudentWeeklyChallengeModal({
  open,
  onClose,
  options,
  challengeId,
  classId,
  studentId,
  onRefresh,
  currentWeek
}: Props) {
  const [step, setStep] = useState<number>(1);
  const [selectedOptionObj, setSelectedOption] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>("");
  const emojiReactions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "👍", label: "Good Job" },
    { emoji: "💡", label: "Learned" },
    { emoji: "🎯", label: "Focused" },
    { emoji: "🚀", label: "Excited" },
  ];
  if (!open) return null;

  // Submit Option
  const submitOption = async () => {
    let selectedOption = selectedOptionObj.optionName;
    const res = await fetch(
      `${API_BASE_URL}weekly-challenges/${challengeId}/response`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentId,
          selectedOption,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message);
      return false;
    }

    //toast.success("Option selected successfully!");
    return true;
  };

  // Submit Reflection
  const submitReflection = async () => {
    await submitOption();
    const res = await fetch(`${API_BASE_URL}reflection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          studentId,
          challengeId,
          currentWeek,
          text:reflectionText,
          emoji:selectedEmoji,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error(data.message);
      return false;
    }

    toast.success("Reflection submitted successfully!");
    onRefresh();
    return true;
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
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-[#1C2C5B]">
                Week Challenge
              </h2>

              <div className="border rounded-2xl p-6 bg-gray-50 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Help the Team Decide
                </h3>
                <p className="text-sm text-gray-600">
                  Choose the best option to move the project forward.
                </p>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-[#1C2C5B]"
                >
                  Start Challenge
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - OPTIONS */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-[#1C2C5B]">
                Choose Your Option
              </h2>

              <div className="space-y-4">
                {options.map((opt, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedOptionObj.optionName === opt.optionName
                        ? "border-[#1C2C5B] bg-[#1c2c5b1a]"
                        : "border-gray-200 hover:border-[#1C2C5B]"
                    }`}
                  >
                    <p className="font-semibold">{opt.optionName}</p>
                  </div>
                ))}
              </div>

              <button
                disabled={!selectedOptionObj.optionName}
                onClick={async () => {
                 setStep(3);
                }}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 bg-[#1C2C5B]"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 3 - REFLECTION PAGE */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1C2C5B] transition"
                >
                  <ArrowLeft size={16} />
                  Back to Options
                </button>
                
              </div>

              {/* Challenge Details Card */}
              <h3 className="font-semibold  uppercase tracking-wider">
                     {selectedOptionObj.optionName}
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
            
                <div>
                  
                  <h2 className="text-lg font-bold text-[#1C2C5B] mt-1">
                  Title
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     {selectedOptionObj.title}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1C2C5B] mt-1">
                    Description
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {selectedOptionObj.description}
                  </p>
                </div>

              </div>

              {/* Reflection Section */}
              <div className="space-y-4">

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Reflection Question
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {selectedOptionObj.reflection_question}
                  </p>
                </div>

                {/* Emoji Selection */}
                <div className="flex justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  {emojiReactions.map((r) => (
                    <div
                      key={r.label}
                      onClick={() => setSelectedEmoji(r.emoji)}
                      className={`flex flex-col items-center cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 ${
                        selectedEmoji === r.emoji
                          ? "bg-[#1C2C5B] text-white scale-105 shadow-md"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="text-xs mt-1">{r.label}</span>
                    </div>
                  ))}
                </div>

                {/* Reflection Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Your Reflection
                  </label>

                  <textarea
                    rows={4}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Write what you learned or experienced..."
                    className="w-full p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1C2C5B] resize-none text-sm"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <button
                disabled={!selectedEmoji || reflectionText.trim() === ""}
                onClick={async () => {
                  const ok = await submitReflection();
                  if (ok) setStep(4);
                }}
                className="w-full py-3 rounded-2xl font-semibold text-white disabled:opacity-40 bg-[#1C2C5B] hover:bg-[#162656] transition"
              >
                Submit Reflection
              </button>
            </div>
          )}

          {/* STEP 4 - COMPLETED */}
          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle size={48} className="mx-auto text-[#1C2C5B]" />
              <h3 className="text-xl font-bold text-[#1C2C5B]">
                Challenge Completed 🎉
              </h3>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl font-semibold text-white bg-[#1C2C5B]"
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