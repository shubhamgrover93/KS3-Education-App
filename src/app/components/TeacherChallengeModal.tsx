import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface ChallengeOption {
  optionName: string;
  title: string;
  description: string;
  reflection_question: string;
}

export interface ChallengeData {
  id?: string;
  title: string;
  sub_title: string;
  description: string;
  week?: string;
  options?: ChallengeOption[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCreate: (challenge: ChallengeData) => void;
  onEdit?: (challenge: ChallengeData, index: number) => void;
  editData?: {
    challenge: ChallengeData;
    index: number;
  };
  classId: string;
}

export default function TeacherChallengeModal({
  open,
  onClose,
  onRefresh,
  editData,
  classId,
}: Props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  /* ================= MAIN FIELDS ================= */
  const [title, setTitle] = useState("");
  const [sub_title, setSubTitle] = useState("");
  const [description, setDescription] = useState("");
  const [week, setWeek] = useState<string>("");
  const [id, setId] = useState<string>("");

  /* ================= OPTIONS STATES ================= */
  const [options, setOptions] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [structuredOptions, setStructuredOptions] = useState<ChallengeOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  /* ================= LOAD EDIT DATA ================= */
  useEffect(() => {
    if (!open) return;

    if (editData) {
      const { challenge } = editData;

      setTitle(challenge.title || "");
      setSubTitle(challenge.sub_title || "");
      setDescription(challenge.description || "");
      setWeek(challenge.week ? String(challenge.week) : "");
      setId(challenge.id || "");

      const restoredOptions = (challenge.options || []) as ChallengeOption[];

      setStructuredOptions(restoredOptions);

      const optionNames = restoredOptions.map((opt) => opt.optionName);

      setOptions(optionNames);
      setDifficulty(optionNames); // auto-check all saved

      setNewOption("");
      setSelectedOptionIndex(null);
    } else {
      // RESET ALL
      setTitle("");
      setSubTitle("");
      setDescription("");
      setWeek("");
      setId("");
      setOptions([]);
      setDifficulty([]);
      setStructuredOptions([]);
      setNewOption("");
      setSelectedOptionIndex(null);
    }
  }, [editData, open]);

  if (!open) return null;

  /* ================= TOGGLE CHECKBOX ================= */
  const toggleOption = (option: string) => {
    setDifficulty((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

 /* ================= ADD OPTION ================= */
const handleAddOption = () => {
  const trimmed = newOption.trim();
  if (!trimmed) return;

  if (!options.includes(trimmed)) {
    const optionName = trimmed;

    // Add to states
    setOptions((prev) => [...prev, optionName]);
    setDifficulty((prev) => [...prev, optionName]);
    setStructuredOptions((prev) => [
      ...prev,
      {
        optionName,
        title: "",
        description: "",
        reflection_question: "",
      },
    ]);

    // Immediately open option detail for the new option
    setSelectedOptionIndex(structuredOptions.length); // new option is at the end
  }

  setNewOption(""); // clear input
};

  /* ================= REMOVE OPTION ================= */
  const handleRemoveOption = (index: number) => {
    const optionName = options[index];

    setOptions((prev) => prev.filter((_, i) => i !== index));
    setDifficulty((prev) => prev.filter((o) => o !== optionName));
    setStructuredOptions((prev) => prev.filter((_, i) => i !== index));

    if (selectedOptionIndex === index) {
      setSelectedOptionIndex(null);
    }
  };

  /* ================= UPDATE OPTION DETAIL ================= */
  const updateOptionField = (
    index: number,
    field: keyof ChallengeOption,
    value: string
  ) => {
    const updated = [...structuredOptions];
    updated[index][field] = value;
    setStructuredOptions(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!title) return toast.error("Title is required!");
    if (!sub_title) return toast.error("Sub title is required!");
    if (!difficulty.length)
      return toast.error("Please select at least one option!");
    if (!week) return toast.error("Week is required!");
    if (!description) return toast.error("Description is required!");

    for (let opt of structuredOptions) {
      if (!opt.title || !opt.description || !opt.reflection_question) {
        return toast.error(`Complete details for ${opt.optionName}`);
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}weekly-challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          id,
          week,
          title,
          subTitle: sub_title,
          description,
          options: structuredOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(editData ? "Challenge updated!" : "Challenge created!");
      onRefresh();
      onClose();
    } catch {
      toast.error("Failed to save challenge");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-white relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {selectedOptionIndex !== null ? (
          /* OPTION DETAIL SCREEN */
          <div className="space-y-4">
            <button
              onClick={() => setSelectedOptionIndex(null)}
              className="text-sm text-blue-600"
            >
              ← Back
            </button>

            <h3 className="font-semibold text-lg">
              {structuredOptions[selectedOptionIndex].optionName} Details
            </h3>
            <div>
              <label>Challenge Title</label>
            <input
              className="w-full border rounded-xl p-3 mt-2"
              placeholder="Challenge Title"
              value={structuredOptions[selectedOptionIndex].title}
              onChange={(e) =>
                updateOptionField(selectedOptionIndex, "title", e.target.value)
              }
            />
            </div>
            
            <div>
              <label>Challenge Description</label>
            <textarea
              rows={3}
              className="w-full border rounded-xl p-3 mt-2"
              placeholder="Challenge Description"
              value={structuredOptions[selectedOptionIndex].description}
              onChange={(e) =>
                updateOptionField(selectedOptionIndex, "description", e.target.value)
              }
            />
            </div>
            
            <div>
              <label>Reflection Question</label>
            <textarea
              rows={3}
              className="w-full border rounded-xl p-3 mt-2"
              placeholder="Reflection Question"
              value={
                structuredOptions[selectedOptionIndex].reflection_question
              }
              onChange={(e) =>
                updateOptionField(
                  selectedOptionIndex,
                  "reflection_question",
                  e.target.value
                )
              }
            />
            </div>
            <button
                
                onClick={() => setSelectedOptionIndex(null)}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 bg-[#1C2C5B] hover:bg-[#162656]"
              >
                Submit
              </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {editData ? "Edit Challenge" : "Create Challenge"}
            </h2>

            <div className="space-y-4">

            {/* WEEK */}
            <div>
              <label className="font-semibold block mb-1">
                Select Week
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Select Week</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Week {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
              {/* TITLE */}
              <div>
                <label className="font-semibold block mb-1">
                  Title
                </label>
                <input
                  className="w-full border rounded-xl p-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* SUB TITLE */}
              <div>
                <label className="font-semibold block mb-1">
                  Sub Title
                </label>
                <input
                  className="w-full border rounded-xl p-3"
                  value={sub_title}
                  onChange={(e) => setSubTitle(e.target.value)}
                />
              </div>

            </div>

            {/* OPTIONS */}
            <div>
              <label className="font-semibold block mb-2">
                Options
              </label>

              <div className="space-y-2 mb-2">
                {options.map((option, index) => {
                  const isSelected = difficulty.includes(option);

                  return (
                    <div
                      key={option}
                      className="flex justify-between items-center border rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOption(option)}
                        />
                        <span>{option}</span>
                      </div>

                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setSelectedOptionIndex(index)}
                          className="text-blue-600"
                        >
                          <Edit2 className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="flex-1 border rounded-xl p-2"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-4 py-2 bg-[#1C2C5B] text-white rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="font-semibold block mb-1">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

          </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-full bg-[#1C2C5B] text-white"
              >
                {editData ? "Update Challenge" : "Create Challenge"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}