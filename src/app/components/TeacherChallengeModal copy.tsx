import { useState , useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export interface ChallengeData {
  title: string;
  subTitleDescription: string;
  // difficulty: string[]; // multiple options
  tags: string[];
  description: string;
  week?: string; // new optional week field
  options?: string[]; // ✅ selected options from create challenge
}


interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (challenge: ChallengeData) => void;
  onEdit?: (challenge: ChallengeData, index: number) => void; // optional edit callback
  editData?: {
    challenge: ChallengeData;
    index: number;
  };
}

export default function TeacherChallengeModal({ open, onClose, onCreate, onEdit, editData }: Props) {
      useEffect(() => {
    if (editData) {
      const { challenge } = editData;
      setTitle(challenge.title);
      setSubTitleDescription(challenge.subTitleDescription);
      setTags(challenge.tags.join(", "));
      setDescription(challenge.description);
    } else {
      setTitle("");
      setSubTitleDescription("");
      // setDifficulty([]);
      setTags("");
      setDescription("");
      // setOptions(["Option 1", "Option 2"]);
      // setNewOption("");

      const defaultOptions = ["Option 1", "Option 2"];

      setOptions(defaultOptions);        // show options
      setDifficulty(defaultOptions);     // ✅ BOTH selected by default
      setNewOption("");
    }
  }, [editData, open]);

  const [title, setTitle] = useState("");
  const [subTitleDescription, setSubTitleDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]); // initial options
  const [newOption, setNewOption] = useState(""); // for manual add
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [week, setWeek] = useState<string>(""); // new state for week

  if (!open) return null;



  // Add or remove option selection
  const toggleOption = (option: string) => {
    setDifficulty(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  // Add manual option
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    if (!options.includes(newOption.trim())) {
      setOptions(prev => [...prev, newOption.trim()]);
    }
    setNewOption("");
  };

const handleSubmit = () => {
  const challenge: ChallengeData = {
    title,
    subTitleDescription,
    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    description,
    options: difficulty, // ✅ pass selected options
  };

  if (editData && onEdit) {
    onEdit(challenge, editData.index);
  } else {
    onCreate(challenge);
  }

  onClose();
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl rounded-3xl p-6 bg-white relative"
      >

        {/* Cross Icon to close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 ">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-check-big w-5 h-5 text-[#1C2C5B] flex-shrink-0 mt-0.5"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
            
            Create a New Challenge</h2>

        <div className="space-y-4">
          {/* Week Dropdown */}
          <div>
            <label className="font-semibold mb-1 block">Select Week:</label>
            <select
              value={week}
              onChange={e => setWeek(e.target.value)}
              className="w-full border rounded-xl p-3"
            >
              <option value="">Select Week</option>
              {Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`).map(w => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded-xl p-3"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <input
            type="text"
            placeholder="Sub Title / Description"
            className="w-full border rounded-xl p-3"
            value={subTitleDescription}
            onChange={e => setSubTitleDescription(e.target.value)}
          />



          {/* Options Selection */}
          <div>
            <p className="mb-2 font-semibold">Select Options:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {options.map(option => {
                const isSelected = difficulty.includes(option);
                return (
                  <label
                    key={option}
                    className={`px-4 py-2 rounded-xl border cursor-pointer ${
                      isSelected
                        ? "bg-[#1C2C5B] text-white border-[#1C2C5B]"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={isSelected}
                      onChange={() => toggleOption(option)}
                      className="hidden"
                    />
                    {option}
                  </label>
                );
              })}
            </div>

            {/* Add new option manually */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new option"
                value={newOption}
                onChange={e => setNewOption(e.target.value)}
                className="flex-1 border rounded-xl p-2"
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-[#1C2C5B] text-white rounded-xl font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* <input
            type="text"
            placeholder="Tags (comma separated)"
            className="w-full border rounded-xl p-3"
            value={tags}
            onChange={e => setTags(e.target.value)}
          /> */}

          <textarea
            placeholder="Description"
            className="w-full border rounded-xl p-3"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-full bg-[#1C2C5B] text-white font-semibold"
            disabled={!title || !subTitleDescription || !description || difficulty.length === 0}
          >
            Create Challenge
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
