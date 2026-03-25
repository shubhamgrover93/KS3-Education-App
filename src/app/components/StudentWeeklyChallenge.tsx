import { motion } from "motion/react";
import { Check, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

interface StudentWeeklyChallengeProps {
  classId: string;
  currentWeek: number;
  showReflection: boolean;
  currentResponseWeek:number;
  onStartChallenge: () => void;
  onStartReflection: () => void;
  currentChallenge:[];
  currentReflection: [];
  refresh?: boolean;
  teams: [];
}

interface WeeklyChallenge {
  week: number;
  title: string;
  description: string;
}

export default function StudentWeeklyChallenge({
  classId,
  currentWeek,
  refresh,
  showReflection,
  currentResponseWeek,
  onStartChallenge,
  onStartReflection,
  currentChallenge,
  currentReflection,
  teams
}: StudentWeeklyChallengeProps) {
  const [loading, setLoading] = useState(true);
  const safeReflection = currentReflection || [];
  useEffect(() => {
   setLoading(false);
   //alert(currentResponseWeek)
  }, [classId, currentWeek, currentResponseWeek, refresh]);

  // 🛡️ Loading state
  if (loading) {
    return (
      <div className="rounded-3xl p-6 bg-white text-center text-gray-500">
        Loading weekly challenge...
      </div>
    );
  }

  // 🛡️ No challenge
  if (!currentChallenge || teams.length < 1) {
    return (
      <div className="rounded-3xl p-6 bg-white text-center text-gray-500">
        Weekly challenge not available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-3xl md:p-6 p-4 py-5 bg-gradient-to-br from-[#1C2C5B]/5 to-[#A78BFA]/5 border-2 border-[#1C2C5B]/20"
    >
      {/* Header */}
      <div className="mb-6">

  {/* Top Row: Icon + Button */}
  <div className="flex items-center justify-between mb-3">

    <div className="w-10 h-10 md:w-16 md:h-16 bg-[#1C2C5B] rounded-2xl flex items-center justify-center">
      <Users className="w-4 h-4 md:w-8 md:h-8 text-white" />
    </div>

    {currentResponseWeek != 0 && (
      <button
        disabled
        className="text-xs md:text-sm flex items-center gap-1 px-3 py-2 rounded-full bg-[#1C2C5B] text-white whitespace-nowrap"
      >
        <Check size={16} />
        Challenge Completed
      </button>
    )}
  </div>

  {/* Text Section - FULL WIDTH */}
  <div>
    <span className="inline-block px-3 py-1 bg-[#1C2C5B] text-white rounded-full text-xs md:text-sm mb-2">
      Week {currentChallenge.week}
    </span>

    <h2 className="text-xl md:text-3xl mb-2 text-[#2D3748]">
      {currentChallenge.title}
    </h2>

    <p className="text-sm md:text-lg text-[#6B7280]">
      {currentChallenge.sub_title}
    </p>
  </div>

</div>


      {/* Activities */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <p className="md:text-lg text-base text-[#6B7280]">
          {currentChallenge.description}
        </p>
      </div>

      {/* CTA */}
      {currentResponseWeek == 0 && (
        <button
          type="button"
          onClick={onStartChallenge}
          className="w-full md:text-lg text-base py-4 rounded-xl bg-[#1C2C5B] text-white"
        >
          Start Challenge
        </button>
      )}
      
      {currentResponseWeek !== 0 && safeReflection.length < 1 &&  (
        <button
          type="button"
          onClick={onStartReflection}
          className="w-full md:text-lg text-base mt-3 flex justify-center gap-1 items-center  py-4 rounded-xl bg-[#1C2C5B] text-white"
        >
          Give Reflection 
        </button>
      )}
      {currentResponseWeek !== 0 && safeReflection.length > 0 &&  (
        <button
          type="button"
          disabled
          className="w-full md:text-lg text-base mt-3 flex justify-center gap-1 items-center  py-4 rounded-xl bg-[#1C2C5B] text-white"
        >
          Reflection submitted 
        </button>
      )}
    </motion.div>
  );
}
