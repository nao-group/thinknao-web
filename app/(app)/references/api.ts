import api from "@/lib/api";
import type { Subject, WordEntry, FormulaEntry } from "./types";

// ─── API response shapes (thinknao-service /api/references) ───────────────────

type ApiSubject = "math" | "physics" | "chemistry" | "liberal_arts_chinese" | "science_chinese";

interface ApiWordExample {
  hanzi?: string | null;
  pinyin?: string | null;
  english?: string | null;
}

interface ApiWord {
  id: string;
  subject: ApiSubject;
  hanzi: string;
  pinyin: string;
  english_word: string;
  english_definition: string;
  example?: ApiWordExample | null;
}

interface ApiFormulaVariable {
  symbol: string;
  meaning: string;
}

interface ApiFormula {
  id: string;
  subject: ApiSubject;
  name_hanzi: string;
  pinyin: string;
  english_name: string;
  formula_latex: string;
  description: string;
  variables: ApiFormulaVariable[];
}

const SUBJECT_LABELS: Record<ApiSubject, Subject> = {
  math: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  liberal_arts_chinese: "Liberal Arts Chinese",
  science_chinese: "Science Chinese",
};

function mapWord(row: ApiWord): WordEntry {
  const example = row.example;
  return {
    id: row.id,
    subject: SUBJECT_LABELS[row.subject],
    term: row.english_word,
    zh: row.hanzi,
    pinyin: row.pinyin,
    definition: row.english_definition,
    example: example
      ? [example.hanzi, example.pinyin && `(${example.pinyin})`, example.english && `— ${example.english}`]
          .filter(Boolean)
          .join(" ")
      : undefined,
  };
}

function mapFormula(row: ApiFormula): FormulaEntry {
  return {
    id: row.id,
    subject: SUBJECT_LABELS[row.subject],
    name: row.english_name,
    zhName: row.name_hanzi,
    pinyin: row.pinyin,
    formula: `$${row.formula_latex}$`,
    description: row.description,
    variables: row.variables.map((v) => `$${v.symbol}$ = ${v.meaning}`),
  };
}

export async function fetchWords(): Promise<WordEntry[]> {
  const { data } = await api.get<ApiWord[]>("/api/references/words");
  return data.map(mapWord);
}

export async function fetchFormulas(): Promise<FormulaEntry[]> {
  const { data } = await api.get<ApiFormula[]>("/api/references/formulas");
  return data.map(mapFormula);
}
