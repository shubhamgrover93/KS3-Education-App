export interface WeeklyChallenge {
  week: number;
  title: string;
  description: string;
  icon: string;
  activities: string[];
}

export const weeklyJourney: WeeklyChallenge[] = [
  {
    week: 1,
    title: "Meet the Team & Choose a Theme",
    description: "Get to know Ella, Ethan, and Jamie, and help them pick a theme for their channel.",
    icon: "users",
    activities: [
      "Meet the creator team",
      "Explore different channel themes",
      "Vote on your favourite idea"
    ]
  },
  {
    week: 2,
    title: "Understanding an Audience",
    description: "Who are Ella and Ethan creating content for? Let's find out!",
    icon: "target",
    activities: [
      "Think about who watches their content",
      "Create a simple audience profile",
      "Share what you learned"
    ]
  },
  {
    week: 3,
    title: "Content Ideas & Planning",
    description: "Time to brainstorm! What videos should the team make next?",
    icon: "lightbulb",
    activities: [
      "Brainstorm video ideas",
      "Plan a simple content calendar",
      "Pick your top 3 favourites"
    ]
  },
  {
    week: 4,
    title: "Branding & Style",
    description: "Help the team develop their unique look and feel.",
    icon: "palette",
    activities: [
      "Design a simple logo or banner",
      "Choose colours and fonts",
      "Create a mood board"
    ]
  },
  {
    week: 5,
    title: "Staying Safe Online",
    description: "Learn how to stay safe and positive while creating content.",
    icon: "shield",
    activities: [
      "Understand privacy settings",
      "Learn about positive commenting",
      "Spot potential risks"
    ]
  },
  {
    week: 6,
    title: "Growth & Engagement",
    description: "How can the team connect with their audience in a friendly way?",
    icon: "trending-up",
    activities: [
      "Explore ways to engage viewers",
      "Practice writing friendly captions",
      "Plan a Q&A session"
    ]
  },
  {
    week: 7,
    title: "Problem-Solving",
    description: "Every creator faces challenges. Let's help the team overcome theirs!",
    icon: "puzzle",
    activities: [
      "Identify common creator challenges",
      "Brainstorm creative solutions",
      "Share your problem-solving ideas"
    ]
  },
  {
    week: 8,
    title: "Reflection & Next Steps",
    description: "Look back at your journey and celebrate what you've learned!",
    icon: "star",
    activities: [
      "Review your favourite moments",
      "Share what you're most proud of",
      "Plan your own creative project"
    ]
  }
];

export const characterBios = {
  ella: {
    name: "Ella",
    role: "The Ideas One",
    description: "Always full of creative ideas and loves brainstorming new video concepts.",
    traits: ["Creative", "Enthusiastic", "Organised"]
  },
  ethan: {
    name: "Ethan",
    role: "The Tech One",
    description: "Great with cameras, editing, and all the technical side of content creation.",
    traits: ["Technical", "Detail-oriented", "Patient"]
  },
  jamie: {
    name: "Jamie",
    role: "The People One",
    description: "Brilliant at connecting with viewers and building a friendly community.",
    traits: ["Friendly", "Engaging", "Supportive"]
  }
};
