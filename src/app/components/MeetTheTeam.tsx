import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { EllaAvatar, EthanAvatar, JamieAvatar } from "./CharacterAvatars"

type CharacterKey = "ella" | "ethan" | "jamie"

const characterBios: Record<
  CharacterKey,
  {
    name: string
    role: string
    color: string
    avatarBg: string
    description: string
    longDescription: string[]
    traits: string[]
  }
> = {
  ella: {
    name: "Ella",
    role: "Creative Leader",
    color: "#F6C453",
    avatarBg: "#F6C453",
    description: "Bright ideas & bold thinking.",
    longDescription: [
      "Ella believes every student has creative potential.",
      "She encourages thinking without limits.",
      "Mistakes are learning moments for her.",
      "She asks powerful questions.",
      "Ella supports shy creators.",
      "She celebrates effort over perfection.",
      "Team collaboration is her strength.",
      "She inspires confidence in ideas.",
      "Ella brings energy into learning.",
      "She helps ideas come to life."
    ],
    traits: ["Creative", "Encouraging", "Curious"]
  },

  ethan: {
    name: "Ethan",
    role: "Growth Mentor",
    color: "#1C2C5B",
    avatarBg: "#1C2C5B",
    description: "Progress through practice.",
    longDescription: [
      "Ethan believes growth takes time.",
      "He helps students build strong habits.",
      "Practice matters more than talent.",
      "Ethan focuses on consistency.",
      "He celebrates small wins.",
      "Failure is feedback for him.",
      "He encourages reflection.",
      "Ethan tracks improvement.",
      "Learning is a journey.",
      "Growth never stops."
    ],
    traits: ["Focused", "Patient", "Motivating"]
  },

  jamie: {
    name: "Jamie",
    role: "Reflection Guide",
    color: "#6B5CA5",
    avatarBg: "#6B5CA5",
    description: "Think deeper, learn better.",
    longDescription: [
      "Jamie helps students reflect deeply.",
      "Thoughtful thinking is her superpower.",
      "She asks meaningful questions.",
      "Jamie values self-awareness.",
      "She encourages honest reflection.",
      "Learning comes from thinking back.",
      "She supports emotional growth.",
      "Jamie builds confidence.",
      "Reflection builds wisdom.",
      "Understanding yourself matters."
    ],
    traits: ["Thoughtful", "Calm", "Insightful"]
  }
}

export default function MeetTheTeam() {
  const [activeCharacter, setActiveCharacter] =
    useState<CharacterKey | null>(null)

  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (activeCharacter) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [activeCharacter])

  return (
    <>
      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(characterBios).map(([key, character]) => (
          <motion.div
            key={key}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-6 text-center shadow-md"
          >
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: character.avatarBg }}
            >
              {key === "ella" && <EllaAvatar size={80} />}
              {key === "ethan" && <EthanAvatar size={80} />}
              {key === "jamie" && <JamieAvatar size={80} />}
            </div>

            <h3 className="text-xl font-semibold text-[#333333]">
              {character.name}
            </h3>

            <p className="font-medium mb-2" style={{ color: character.color }}>
              {character.role}
            </p>

            <p className="text-sm text-gray-600 mb-4">
              {character.description}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {character.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: `${character.color}22`,
                    color: character.color
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>

            <button
              onClick={() => setActiveCharacter(key as CharacterKey)}
              className="w-full py-3 rounded-full text-white font-semibold"
              style={{ backgroundColor: character.color }}
            >
              Continue
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeCharacter && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCharacter(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-8 relative"
              style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveCharacter(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition hover:scale-110"
                style={{
                  backgroundColor:
                    characterBios[activeCharacter].color + "22",
                  color: characterBios[activeCharacter].color
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div className="flex items-center gap-5 mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor:
                      characterBios[activeCharacter].avatarBg
                  }}
                >
                  {activeCharacter === "ella" && <EllaAvatar size={64} />}
                  {activeCharacter === "ethan" && <EthanAvatar size={64} />}
                  {activeCharacter === "jamie" && <JamieAvatar size={64} />}
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#333333]">
                    {characterBios[activeCharacter].name}
                  </h2>
                  <p
                    className="font-medium"
                    style={{
                      color: characterBios[activeCharacter].color
                    }}
                  >
                    {characterBios[activeCharacter].role}
                  </p>
                </div>
              </div>

              {/* Traits */}
              <div className="flex flex-wrap gap-2 mb-6">
                {characterBios[activeCharacter].traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor:
                        characterBios[activeCharacter].color + "22",
                      color: characterBios[activeCharacter].color
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="h-px bg-gray-200 mb-6" />

              {/* Description */}
              <div className="max-h-[260px] overflow-y-auto pr-2">
                <p
                  className="rounded-xl p-4 text-sm leading-relaxed text-[#333333]"
                  style={{
                    backgroundColor:
                      characterBios[activeCharacter].color + "12"
                  }}
                >
                  {characterBios[activeCharacter].longDescription.join(" ")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
