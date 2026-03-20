// SpeakSprint – Word/Topic Database

export const TOPICS = {
  easy: [
    "Home", "Food", "Friends", "Music", "Pets", "Hobbies", "Sports",
    "School", "Family", "Dreams", "Summer", "Winter", "Colors", "Travel",
    "Movies", "Books", "Games", "Nature", "Cooking", "Shopping",
    "Happiness", "Morning", "Evening", "Weekend", "Memories",
    "Weather", "Kindness", "Laughter", "Childhood", "Gratitude",
  ],
  medium: [
    "Ambition", "Leadership", "Innovation", "Success", "Failure",
    "Technology", "Creativity", "Discipline", "Communication", "Teamwork",
    "Social Media", "Climate Change", "Mental Health", "Work-Life Balance",
    "Learning", "Motivation", "Resilience", "Empathy", "Education",
    "Culture", "Identity", "Change", "Responsibility", "Confidence",
    "Time Management", "Digital Life", "Minimalism", "Personal Growth", "Habits",
  ],
  hard: [
    "Existentialism", "Artificial Intelligence Ethics", "Global Inequality",
    "The Nature of Consciousness", "Post-Truth Society", "Cognitive Biases",
    "Geopolitical Tensions", "Transhumanism", "Epistemology",
    "The Future of Democracy", "Decolonization", "Quantum Computing Implications",
    "Climate Justice", "The Meaning of Progress", "Digital Privacy",
    "Universal Basic Income", "Decentralized Finance", "Bioethics",
    "Philosophical Nihilism", "The Anthropocene", "Surveillance Capitalism",
    "Systems Thinking", "The Experience Machine", "Colonization of Mars",
    "Post-Humanism", "Moral Relativism", "The Attention Economy",
    "Cultural Appropriation", "The Nature of Time", "Technological Singularity",
  ],
};

export const DIFFICULTY_COLORS = {
  easy:   { bg: "#10b981", label: "Easy" },
  medium: { bg: "#f59e0b", label: "Medium" },
  hard:   { bg: "#ef4444", label: "Hard" },
};

export const BADGES = [
  { id: "first_session",  label: "First Step",   icon: "🎤", description: "Complete your first session",  requirement: 1,  type: "sessions" },
  { id: "sessions_5",     label: "Warm Up",       icon: "🔥", description: "Complete 5 sessions",          requirement: 5,  type: "sessions" },
  { id: "sessions_25",    label: "Speaker",       icon: "🎙️", description: "Complete 25 sessions",         requirement: 25, type: "sessions" },
  { id: "sessions_100",   label: "Orator",        icon: "🏆", description: "Complete 100 sessions",        requirement: 100, type: "sessions" },
  { id: "streak_3",       label: "3-Day Streak",  icon: "⚡", description: "Practice 3 days in a row",    requirement: 3,  type: "streak" },
  { id: "streak_7",       label: "Week Warrior",  icon: "🗓️", description: "Practice 7 days in a row",    requirement: 7,  type: "streak" },
  { id: "streak_30",      label: "Legend",        icon: "👑", description: "Practice 30 days in a row",   requirement: 30, type: "streak" },
  { id: "points_100",     label: "Century",       icon: "💯", description: "Earn 100 points",             requirement: 100, type: "points" },
  { id: "hard_session",   label: "Challenge Ace", icon: "💎", description: "Complete a hard difficulty session", requirement: 1, type: "hard_sessions" },
];

export const POINTS_PER_SESSION = { easy: 10, medium: 20, hard: 35 };
