import { motion } from "motion/react";
import { BookOpen, User, ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClassInfo {
  code: string;
  nickname: string;
  teacherName: string;
  lastRated?: Date;
  currentRating?: number;
  joinedAt: Date;
}

interface StudentClassesProps {
  classes: ClassInfo[];
  onBack: () => void;
  onJoinAnother: () => void;
  onRateClass: (classCode: string, rating: number) => void;
  onOpenClass: (classCode: string) => void; 
}

// Emoji rating system
const ratingEmojis = [
  { emoji: "😢", label: "Very Bad", value: 1 },
  { emoji: "😕", label: "Bad", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "😊", label: "Good", value: 4 },
  { emoji: "🤩", label: "Excellent", value: 5 },
];

export default function StudentClasses({
  classes,
  onBack,
  onJoinAnother,
  onRateClass,
  onOpenClass,
}: StudentClassesProps) {

  const [hoveredRating, setHoveredRating] = useState<{
    classCode: string;
    rating: number;
  } | null>(null);
  // Check if a class can be rated (once per week)
  const canRateClass = (classInfo: ClassInfo) => {
    if (!classInfo.lastRated) return true;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return classInfo.lastRated < oneWeekAgo;
  };

  const getDaysUntilNextRating = (classInfo: ClassInfo) => {
    if (!classInfo.lastRated) return 0;
    const nextRatingDate = new Date(classInfo.lastRated);
    nextRatingDate.setDate(nextRatingDate.getDate() + 7);
    const today = new Date();
    const diffTime = nextRatingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diffDays);
  };

  const handleRating = (classCode: string, rating: number) => {
    onRateClass(classCode, rating);
    const selectedEmoji = ratingEmojis.find(
      (e) => e.value === rating,
    );
    toast.success(
      `You rated this class ${selectedEmoji?.emoji} ${selectedEmoji?.label}!`,
    );
  };

  const getRatingLabel = (rating: number) => {
    const found = ratingEmojis.find((e) => e.value === rating);
    return found ? found.label : "";
  };




  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all hover:shadow-md"
            style={{ backgroundColor: 'white', color: '#333333' }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 style={{ color: '#333333', fontSize: '2.5rem' }}>
                👨‍🎓 My Classes
              </h1>
              <p style={{ color: '#333333', opacity: 0.7, marginTop: '0.5rem' }}>
                You're enrolled in {classes.length} {classes.length === 1 ? 'class' : 'classes'}
              </p>
            </div>
            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onJoinAnother}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:shadow-lg"
              style={{
                backgroundColor: '#1C2C5B',
                color: 'white',
                fontSize: '1.125rem',
              }}
            >
              <Plus size={20} />
              Join Another Class
            </motion.button> */}
          </div>
        </motion.div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classInfo, index) => (
            <motion.div
              key={classInfo.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onOpenClass(classInfo.code)}
              className="rounded-3xl p-6 bg-white cursor-pointer"
              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}
            >
              {/* Class Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: index % 2 === 0 ? '#F78C2B' : '#1C2C5B',
                }}
              >
                <BookOpen size={28} color="white" />
              </div>

              {/* Class Code */}
              <h3 className="mb-2" style={{ color: '#333333', fontSize: '1.5rem' }}>
                Class {classInfo.code}
              </h3>

              {/* Student Info */}
              {/* <div className="flex items-center gap-2 mb-4">
                <User size={16} style={{ color: '#333333', opacity: 0.6 }} />
                <span style={{ color: '#333333', opacity: 0.7 }}>
                  {classInfo.nickname}
                </span>
              </div> */}
              <div className="flex items-center gap-2 mb-4">
                👩‍🏫 Teacher Name 
              </div>

              {/* Status Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: '#E7F6F3',
                  color: '#1C2C5B',
                  fontSize: '0.875rem',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#1C2C5B' }}
                ></span>
                Active
              </div>

              {/* Joined Date */}
              <p
                className="mt-4"
                style={{ color: '#333333', opacity: 0.5, fontSize: '0.875rem' }}
              >
                Joined {classInfo.joinedAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </motion.div>
          ))}

          {/* Add Another Class Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: classes.length * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={onJoinAnother}
            className="rounded-3xl p-6 bg-white cursor-pointer flex flex-col items-center justify-center border-2 border-dashed"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderColor: '#1C2C5B',
              minHeight: '250px',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#E7F6F3' }}
            >
              <Plus size={32} style={{ color: '#1C2C5B' }} />
            </div>
            <h3 className="text-center" style={{ color: '#1C2C5B', fontSize: '1.25rem' }}>
              Join Another Class
            </h3>
            <p
              className="text-center mt-2"
              style={{ color: '#333333', opacity: 0.6, fontSize: '0.875rem' }}
            >
              Got a new class code?
            </p>
          </motion.div>
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center mb-6 mx-auto"
              style={{ backgroundColor: 'white' }}
            >
              <span style={{ fontSize: '4rem' }}>📚</span>
            </div>
            <h2 className="mb-4" style={{ color: '#333333', fontSize: '2rem' }}>
              No classes yet
            </h2>
            <p className="mb-8" style={{ color: '#333333', opacity: 0.7 }}>
              Join your first class to get started with your learning journey!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onJoinAnother}
              className="px-8 py-4 rounded-2xl transition-all hover:shadow-lg"
              style={{
                backgroundColor: '#1C2C5B',
                color: 'white',
                fontSize: '1.125rem',
              }}
            >
              Join Your First Class
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
