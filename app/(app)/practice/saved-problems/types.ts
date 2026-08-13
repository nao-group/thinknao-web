export type SubjectKey = "Mathematics" | "Physics" | "Chemistry" | "Liberal Arts Chinese" | "Science Chinese";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface SavedProblem {
  id: string;
  subject: SubjectKey;
  difficulty: Difficulty;
  topic: string;
  setName: string;
  setSlug: string;
  question: string;
  image?: string;
  options: { key: string; text: string; text_zh?: string }[];
  correctAnswer: string;
  explanation: {
    correctStatement: string;
    intro: string;
    steps: string[];
    conclusion: string;
    markdown?: string;
  };
  dateAdded: string;
  zh?: {
    topic: string;
    question: string;
    explanation: {
      correctStatement: string;
      intro: string;
      steps: string[];
      conclusion: string;
      markdown?: string;
    };
  };
}
