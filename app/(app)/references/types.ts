export type Subject = "Mathematics" | "Physics" | "Chemistry" | "Humanities Chinese" | "STEM Chinese";

export interface WordEntry {
  id: string;
  subject: Subject;
  term: string;       // English term
  zh?: string;        // Chinese characters
  pinyin?: string;    // Romanised pronunciation
  definition: string;
  example?: string;
}

export interface FormulaEntry {
  id: string;
  subject: Subject;
  name: string;       // English name
  zhName?: string;    // Chinese name
  pinyin?: string;
  formula: string;
  description: string;
  variables?: string[];
}
