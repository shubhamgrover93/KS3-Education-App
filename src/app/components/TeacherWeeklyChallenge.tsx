import { useState, useEffect } from "react";
import { Users, Edit2, Trash2, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChallengeData {
  id?: number;
  week: number;
  title: string;
  sub_title?: string;
  description: string;
  options?: string[];
  created_at?: string;
}

interface ClassDashboardChallengesProps {
  classId: string;
  refresh?: boolean;
  onEdit?: (challenge: ChallengeData, index: number) => void;
  onStartChallenge?: (challenge: ChallengeData) => void;
}

export default function ClassDashboardChallenges({
  classId,
  refresh,
  onEdit = () => {},
  onStartChallenge = () => {},
}: ClassDashboardChallengesProps) {
  const [allChallenges, setAllChallenges] = useState<ChallengeData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [deleteChallengeId, setDeleteChallengeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ---------------- FETCH CHALLENGES ----------------
  const fetchChallenges = async (week?: number | "all") => {
    try {
      setLoading(true);
      const params = week && week !== "all" ? `?week=${week}` : "?week=1";
      const res = await fetch(
        `${API_BASE_URL}weekly-challenges/${classId}${params}`
      );
      const data = await res.json();

      if (data.success) {
        setAllChallenges(data.data);
      }
    } catch (error) {
      console.error("Fetch challenges error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges(selectedWeek);
  }, [selectedWeek, refresh]);

  // ---------------- DELETE CHALLENGE ----------------
  const handleDelete = async (challengeId: number) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}weekly-challenges/${challengeId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete challenge");
        return;
      }

      toast.success("Challenge deleted successfully");
      fetchChallenges(selectedWeek);
      setDeleteChallengeId(null);
    } catch (error) {
      console.error("Delete challenge error:", error);
      toast.error("Server error");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="md:text-2xl text-xl font-semibold text-gray-800">
          🎯 Weekly Challenge
        </h2>

        <select
          value={selectedWeek}
          onChange={(e) =>
            setSelectedWeek(
              e.target.value === "all" ? "all" : parseInt(e.target.value)
            )
          }
          className="border rounded-[5px] p-2"
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
      </div>

      {/* Challenge List */}
      {loading ? (
        <p className="text-center text-gray-500 p-6">Loading challenges...</p>
      ) : allChallenges.length === 0 ? (
        <p className="text-[#f78c2b] mt-4 flex gap-2 items-center justify-center p-6 border border-[#f78e2b50] rounded-xl bg-[#f78e2b15]">
          <Info className="w-5 h-5" />
          Challenge not available.
        </p>
      ) : (
        <div className="space-y-4">
          {allChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gray-50 border border-gray-200 shadow p-6 relative"
            >
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => onEdit(challenge, index)}
                  className="p-1 rounded-lg hover:bg-gray-200"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>

                <button
                  onClick={() => setDeleteChallengeId(challenge.id!)}
                  className="p-1 rounded-lg hover:bg-gray-200"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>

              {/* Header */}
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-[#1C2C5B] rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-[#1C2C5B] text-white rounded-full text-sm mb-2">
                    Week {challenge.week}
                  </span>

                  <h2 className="text-2xl text-[#2D3748]">
                    {challenge.title}
                  </h2>

                  <p className="text-gray-500">{challenge.sub_title}</p>
                </div>
              </div>

              {/* Options */}
              {challenge.options?.length ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {challenge.options.map((opt, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm bg-[#1C2C5B]/10 text-[#1C2C5B]"
                    >
                      {opt.optionName}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Description */}
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-gray-600">{challenge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteChallengeId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-96 relative"
            >
              <button
                onClick={() => setDeleteChallengeId(null)}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h3 className="text-xl font-semibold mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this challenge?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteChallengeId(null)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteChallengeId)}
                  className="flex-1 bg-[#1C2C5B] text-white rounded-xl py-2"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
