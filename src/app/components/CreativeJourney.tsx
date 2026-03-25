import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Users, X } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface CreativeJourneyProps {
  currentWeek: number;
  teamId: number;
  classId: number;
  studentId: number;
  totalWeeks?: number;
}

export default function CreativeJourney({
  currentWeek,
  teamId,
  classId,
  studentId,
  totalWeeks = 8,
}: CreativeJourneyProps) {

  const [open, setOpen] = useState(false);
  const [currentResponseWeek, setCurrentResponseWeek] = useState(0);
  const [currentChallengeResponse, setCurrentChallengeResponse] = useState<any>(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [currentReflection, setPreviewReflections] = useState([]);
  

  // ✅ Fetch Function
  const fetchChallengeResponse = async (weekNumber: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}weekly-student-challenges/${classId}/${teamId}/responses?week=${weekNumber}`
      );

      const data = await res.json();

      if (data.success && data.data?.length) {
        const response = data.data[0];
        setCurrentChallengeResponse(response);
        setCurrentResponseWeek(Number(response.week));
      } else {
        setCurrentChallengeResponse(null);
      }
    } catch (error) {
      console.error("Failed to load challenge", error);
    }
  };
   const fetchReflection = async (weekNumber: number) => {
    try {
    
         const res = await fetch(
            `${API_BASE_URL}reflection/studentHistory/${studentId}/${classId}/${weekNumber}`
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
  const fetchCompletedWeeks = async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}weekly-student-challenges/${classId}/${teamId}/responses`
    );

    const data = await res.json();

    if (data.success && data.data?.length) {
      const weeks = data.data.map(item => Number(item.week));
      setCompletedWeeks(weeks);
    }
  } catch (error) {
    console.error(error);
  }
};
  // ✅ Call API when currentWeek changes
  useEffect(() => {
    if (teamId && classId) {
      fetchCompletedWeeks();
    }
  }, [teamId, classId, currentWeek]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const currentWeekNumber = Number(currentResponseWeek) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 bg-white my-8 relative"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
    >
      <h3 className="md:mb-8 mb-4 md:text-2xl text-xl font-semibold">
        Your Creative Journey
      </h3>

      <div className="relative mb-6 container max-w-[1072px] mx-auto">

        {/* Background Line */}
        <div className="absolute md:top-6 top-3 left-0 right-0 md:h-[4px] h-[2px] rounded-full bg-gray-200" />

        {/* Progress Line */}
        <div
          className="absolute md:top-6 top-3 left-0 md:h-[4px] h-[2px] rounded-full transition-all bg-[#1C2C5B]"
          style={{
            width: `${((currentWeek - 1) / (totalWeeks - 1)) * 100}%`,
          }}
        />

        <div className="flex items-center justify-between relative z-10">

          {Array.from({ length: totalWeeks }).map((_, index) => {
            const weekNumber = index + 1;
            console.log('completedWeeks',completedWeeks);
            const isCompleted = completedWeeks.includes(weekNumber);
            const isActive = completedWeeks.includes(weekNumber);
            return (
              <div
                key={weekNumber}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.1, 1] }
                      : { scale: 1 }
                  }
                  transition={{
                    duration: 1.8,
                    repeat: isActive ? Infinity : 0,
                  }}
                  className="md:w-12 w-7 md:h-12 h-7 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={async () => {
                      if (teamId && classId && isActive) {
                        await fetchChallengeResponse(weekNumber); // PASS weekNumber here
                        await fetchReflection(weekNumber); 
                        setOpen(true); // open modal AFTER data loads
                      }
                    }}
                  style={{
                    backgroundColor:
                      isCompleted || isActive
                        ? "#1C2C5B"
                        : "#F5F5F5",
                    border: "2px solid",
                    borderColor:
                      isCompleted || isActive
                        ? "transparent"
                        : "#CBD5E1",
                    color:
                      isCompleted || isActive
                        ? "white"
                        : "#333333",
                  }}
                >
                  {isCompleted || isActive ? (
                    <Check size={20} />
                  ) : (
                    weekNumber
                  )}
                </motion.div>

                <span
                  className="text-xs"
                  style={{
                    opacity: isCompleted || isActive ? 1 : 0.5,
                  }}
                >
                  Week {weekNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-sm opacity-60">
        {currentResponseWeek} of {totalWeeks} weeks completed
      </p>

      {/* MODAL */}
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white
                  w-full
                  max-w-md
                  rounded-3xl
                  p-5
                  sm:p-6
                  shadow-xl
                  relative"
                  onClick={(e) => e.stopPropagation()}
                  style={{}}
                >
                  {/* close */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
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
                        Week {currentChallengeResponse.week}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      {currentChallengeResponse.title}
                    </h3>
                    <p className="text-sm opacity-70 mb-4">
                      {currentChallengeResponse.sub_title}
                    </p>

                    <div className="bg-white rounded-xl p-4 text-sm opacity-80">
                      {currentChallengeResponse.description}
                    </div>
                  </div>

                  {/* ========= OPTIONS ========= */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-xl">
                     Selected Options
                    </h4>

                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB]">
                        {/* <div className="w-4 h-4 rounded-full border-2 border-[#1C2C5B]" /> */}
                        <span className="text-sm">{currentChallengeResponse.selectedOption}</span>
                      </div>

                      
                    </div>
                  </div>

                  {/* ========= REFLECTION ========= */}
                  {currentReflection.map((reflection, index) => (
                  <div className="bg-white rounded-2xl p-5 border mb-4">

                  
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center font-semibold">
                        {reflection.nickname}
                      </div>
                      <div>
                      </div>
                    </div>

                    <div className="bg-[#F9FAFB] rounded-xl p-4 flex gap-3 items-start">
                      <span className="text-2xl">{reflection.emoji}</span>
                      {/* <span className="text-xs text-gray-400">
                          Week of {reflection.date}
                        </span> */}
                      <p className="text-sm">
                        {reflection.text}
                      </p>
                    </div>
                    
                  </div>
                  ))}
                  {/* BUTTON */}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-3 rounded-full text-white font-semibold"
                    style={{ backgroundColor: "#1C2C5B" }}
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
    </motion.div>
  );
}