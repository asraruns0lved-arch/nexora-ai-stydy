export type ToolField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
};

export type ToolDef = {
  key: string;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  system: string;
  fields: ToolField[];
};

const topic: ToolField = {
  name: "topic",
  label: "Topic or question",
  type: "textarea",
  placeholder: "Paste your question, topic or notes…",
};

const level: ToolField = {
  name: "level",
  label: "Level",
  type: "select",
  options: ["Middle school", "High school", "Undergraduate", "Graduate"],
};

export const TOOLS: ToolDef[] = [
  {
    key: "study-assistant",
    name: "Study Assistant",
    tagline: "Explain anything, step by step",
    icon: "GraduationCap",
    accent: "195",
    system:
      "You are Nexora Study Assistant. Explain concepts clearly with analogies, worked examples and a short recap. Use markdown headings and bullet points.",
    fields: [topic, level],
  },
  {
    key: "summarizer",
    name: "Summarizer",
    tagline: "Long text into crisp takeaways",
    icon: "AlignLeft",
    accent: "205",
    system:
      "You are an expert academic summarizer. Produce a TL;DR, key points as bullets, and a glossary of important terms.",
    fields: [
      { name: "text", label: "Text to summarize", type: "textarea", placeholder: "Paste article, chapter or transcript…" },
      { name: "length", label: "Length", type: "select", options: ["Short", "Medium", "Detailed"] },
    ],
  },
  {
    key: "notes",
    name: "Smart Notes",
    tagline: "Structured, revision-ready notes",
    icon: "NotebookPen",
    accent: "215",
    system:
      "You generate structured revision notes: hierarchical headings, concise bullets, formulas highlighted, and a 'Common mistakes' section.",
    fields: [topic, level],
  },
  {
    key: "quiz",
    name: "Quiz Generator",
    tagline: "Practice questions with answers",
    icon: "ListChecks",
    accent: "225",
    system:
      "You create quizzes. Output numbered questions first, then an 'Answer key' section with explanations.",
    fields: [
      topic,
      { name: "count", label: "Number of questions", placeholder: "10" },
      { name: "format", label: "Format", type: "select", options: ["Multiple choice", "Short answer", "True/False", "Mixed"] },
    ],
  },
  {
    key: "flashcards",
    name: "Flashcards",
    tagline: "Spaced-repetition ready cards",
    icon: "Layers",
    accent: "235",
    system:
      "You create flashcards. Output a markdown table with columns Front | Back. Keep each side under 25 words.",
    fields: [topic, { name: "count", label: "Number of cards", placeholder: "15" }],
  },
  {
    key: "math",
    name: "Math Solver",
    tagline: "Worked solutions, not just answers",
    icon: "Sigma",
    accent: "245",
    system:
      "You are a rigorous math tutor. Solve step by step, state the rule used at each step, and finish with the boxed final answer plus a sanity check.",
    fields: [{ ...topic, label: "Problem" }, level],
  },
  {
    key: "physics",
    name: "Physics Lab",
    tagline: "Concepts, formulas, derivations",
    icon: "Atom",
    accent: "255",
    system:
      "You are a physics tutor. Identify givens, unknowns, relevant laws, then solve with units shown throughout and explain the physical intuition.",
    fields: [{ ...topic, label: "Problem or concept" }, level],
  },
  {
    key: "chemistry",
    name: "Chemistry Lab",
    tagline: "Reactions, balancing, mechanisms",
    icon: "FlaskConical",
    accent: "265",
    system:
      "You are a chemistry tutor. Balance equations, show stoichiometry, explain mechanisms with arrow-pushing described in words, and note safety.",
    fields: [{ ...topic, label: "Problem or reaction" }, level],
  },
  {
    key: "coding",
    name: "Coding Mentor",
    tagline: "Debug, explain, and learn code",
    icon: "Code2",
    accent: "275",
    system:
      "You are a patient programming mentor. Give working, commented code in fenced blocks, explain the approach, complexity, and pitfalls.",
    fields: [
      { name: "task", label: "Task or code", type: "textarea", placeholder: "Describe the task or paste the code…" },
      { name: "language", label: "Language", placeholder: "Python, JavaScript, C++…" },
    ],
  },
  {
    key: "writing",
    name: "Writing Studio",
    tagline: "Essays, edits, and tone control",
    icon: "PenLine",
    accent: "285",
    system:
      "You are an academic writing coach. Improve clarity and structure, keep the student's voice, and end with a short list of edits you made.",
    fields: [
      { name: "text", label: "Prompt or draft", type: "textarea", placeholder: "Paste your draft or describe the assignment…" },
      { name: "tone", label: "Tone", type: "select", options: ["Academic", "Persuasive", "Narrative", "Concise"] },
    ],
  },
  {
    key: "research",
    name: "Research Helper",
    tagline: "Outlines, arguments, citations",
    icon: "Telescope",
    accent: "295",
    system:
      "You are a research assistant. Provide a thesis, structured outline, key arguments with counterpoints, and suggested source types. Never invent specific citations — describe what to look for.",
    fields: [{ ...topic, label: "Research question" }, level],
  },
  {
    key: "exam-generator",
    name: "Exam Generator",
    tagline: "Full mock papers with marking",
    icon: "FileCheck2",
    accent: "305",
    system:
      "You generate full mock exam papers: sections, marks per question, time allocation, then a detailed mark scheme.",
    fields: [
      { ...topic, label: "Subject & syllabus" },
      { name: "duration", label: "Duration", placeholder: "90 minutes" },
      level,
    ],
  },
  {
    key: "presentation",
    name: "Presentation Maker",
    tagline: "Slide-by-slide decks",
    icon: "Presentation",
    accent: "315",
    system:
      "You design presentations. Output slide-by-slide: '## Slide N — Title', 3-5 bullets, and a 'Speaker notes' line for each.",
    fields: [
      { ...topic, label: "Deck topic" },
      { name: "slides", label: "Number of slides", placeholder: "10" },
    ],
  },
  {
    key: "study-planner",
    name: "Study Planner",
    tagline: "A realistic schedule that sticks",
    icon: "CalendarClock",
    accent: "325",
    system:
      "You build study plans. Output a day-by-day markdown table with focus blocks, breaks, revision cycles and milestones.",
    fields: [
      { name: "goal", label: "Goal & subjects", type: "textarea", placeholder: "Finals in 3 weeks: calculus, organic chemistry…" },
      { name: "hours", label: "Hours available per day", placeholder: "4" },
      { name: "deadline", label: "Deadline", placeholder: "In 21 days" },
    ],
  },
  {
    key: "language",
    name: "Language Coach",
    tagline: "Practice, translate, correct",
    icon: "Languages",
    accent: "335",
    system:
      "You are a language coach. Correct grammar with explanations, give natural alternatives, and add a short practice drill.",
    fields: [
      { name: "text", label: "Text or goal", type: "textarea", placeholder: "Paste text or say what you want to practise…" },
      { name: "language", label: "Target language", placeholder: "Spanish" },
    ],
  },
  {
    key: "career",
    name: "Career Guide",
    tagline: "Applications, CVs, interviews",
    icon: "Compass",
    accent: "345",
    system:
      "You are a student career advisor. Give concrete, actionable guidance with examples and a next-steps checklist.",
    fields: [{ ...topic, label: "What do you need help with?" }],
  },
];

export const getTool = (key: string) => TOOLS.find((t) => t.key === key);
