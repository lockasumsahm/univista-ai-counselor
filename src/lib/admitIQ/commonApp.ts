export interface CommonAppPrompt {
  id: number;
  short: string;
  full: string;
  whatColleges: string;
  structureTip: string;
  pitfall: string;
  formula: string;
}

export const COMMON_APP_PROMPTS: CommonAppPrompt[] = [
  {
    id: 1,
    short: "Background / Identity",
    full: "Some students have a background, identity, interest, or talent so meaningful they believe their application would be incomplete without it. If this sounds like you, please share your story.",
    whatColleges: "Who you are at the deepest level, and how it'll show up on campus.",
    structureTip: "Lead with sensory specificity — one moment that signals identity. Avoid 'I'm a curious person' — show it.",
    pitfall: "Listing identities like a résumé. Pick ONE thread and go deep.",
    formula: "Personal object/scene → backstory → growth → present meaning.",
  },
  {
    id: 2,
    short: "Challenge / Failure",
    full: "The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?",
    whatColleges: "How you respond to adversity and whether you reflect honestly.",
    structureTip: "Spend 60% on what you LEARNED, not what happened. The challenge is the setup; growth is the essay.",
    pitfall: "Trauma-dumping or making the failure sound performative ('I lost a tournament').",
    formula: "Concrete setback → emotional truth → reframe → action → mindset shift.",
  },
  {
    id: 3,
    short: "Belief / Idea Challenged",
    full: "Reflect on a time when you questioned or challenged a belief or idea. What prompted your thinking? What was the outcome?",
    whatColleges: "Intellectual courage and self-awareness.",
    structureTip: "Pick a belief that actually had stakes for you — political, religious, family. Vague beliefs read as fake.",
    pitfall: "Choosing a 'safe' belief and ending with 'I learned both sides matter.'",
    formula: "Held belief → friction event → wrestle → updated view → cost paid.",
  },
  {
    id: 4,
    short: "Gratitude",
    full: "Reflect on something that someone has done for you that has made you happy or thankful in a surprising way. How has this gratitude affected or motivated you?",
    whatColleges: "Capacity for warmth, attention, and reciprocity.",
    structureTip: "Specific person, specific moment. Avoid 'my parents'.",
    pitfall: "Making the essay about THEM, not about how it changed YOU.",
    formula: "Small unexpected act → shift in you → action you took since.",
  },
  {
    id: 5,
    short: "Accomplishment / Realization",
    full: "Discuss an accomplishment, event, or realization that sparked a period of personal growth and a new understanding of yourself or others.",
    whatColleges: "Your capacity to grow and to recognize growth.",
    structureTip: "Smaller is often better. A quiet realization beats a trophy story.",
    pitfall: "Bragging tone. Stay reflective, not triumphant.",
    formula: "Trigger → before-state → realization → after-state.",
  },
  {
    id: 6,
    short: "Topic / Captivation",
    full: "Describe a topic, idea, or concept you find so engaging it makes you lose all track of time. Why does it captivate you? What or who do you turn to when you want to learn more?",
    whatColleges: "How you learn and what your mind does when no one's watching.",
    structureTip: "Show the rabbit-hole behavior — books, late nights, weird tangents.",
    pitfall: "Naming a famous topic generically. Get specific to a sub-question.",
    formula: "Spark → obsession evidence → people/resources → open question that drives you.",
  },
  {
    id: 7,
    short: "Free Choice",
    full: "Share an essay on any topic of your choice. It can be one you've already written, one that responds to a different prompt, or one of your own design.",
    whatColleges: "Whatever you decide best represents you.",
    structureTip: "Use this when none of 1–6 fit. Don't use it as an excuse to be vague.",
    pitfall: "Reads as 'I couldn't pick one' — make sure your structure is tighter than the others.",
    formula: "Same rules as prompts 1–6 — just on your own terms.",
  },
];

export const STRONG_ESSAY_FORMULA = [
  { step: "1", title: "Personal object or story", body: "A specific thing only you can describe." },
  { step: "2", title: "Core theme", body: "Curiosity, growth, perseverance, identity, belonging." },
  { step: "3", title: "Unique twist", body: "The angle no other applicant could write." },
];

export const SIMPLE_STRUCTURE = [
  { step: "Hook", body: "Vivid scene — sensory, specific, in medias res." },
  { step: "Background", body: "Just enough to ground the reader." },
  { step: "Turning point", body: "The moment something shifts." },
  { step: "Growth", body: "Two examples of how you've changed." },
  { step: "Conclusion", body: "Forward-looking — who you'll be on campus." },
];
