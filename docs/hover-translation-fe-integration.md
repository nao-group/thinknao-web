# Hover Translation — Frontend Integration Guide

**Feature**: Vocabulary hover tooltips for bilingual practice + annotated explanations
**Backend branch**: `feat/practice`
**Last updated**: 2026-08-31

---

## Overview

Every question (and passage) ships with a pre-computed `alignment` object containing:
1. **`vocab`** — a full vocabulary dictionary for every word in the question, answer choices, and explanation. No words are filtered out (particles like 的/了 and single-character words are included).
2. **`explanation`** — the explanation text re-written with `{n}` markers replacing key vocabulary words, plus numbered entries giving the ZH word, EN translation, pinyin, and a context note.

No runtime translation calls are needed. All data is embedded in the API response.

---

## Data Types

### `Alignment` object (on `question.alignment`)

```ts
interface VocabEntry {
  pinyin: string        // tone-marked, e.g. "xíng zhuàng"
  en: string            // English meaning, e.g. "shape"
  en_phrase?: string    // only present when the EN text phrasing genuinely differs from `en`
                        // e.g. en="uniform linear motion", en_phrase="moves at constant speed"
                        // use en_phrase for EN→ZH substring matching; fall back to en when absent
}

interface EnVocabEntry {
  zh: string      // Chinese equivalent word/phrase
  pinyin: string  // tone-marked pinyin of the Chinese word
}

interface ExplanationAlignment {
  vocab_zh?: Record<string, VocabEntry>   // every ZH word in the ZH explanation (same format as Alignment.vocab)
  vocab_en?: Record<string, EnVocabEntry> // every EN content word in the EN explanation, keyed by English word
}

interface Alignment {
  vocab: Record<string, VocabEntry>  // key = Chinese word/phrase (covers question + choices + explanation)
  explanation?: ExplanationAlignment // present when explanation vocab extraction succeeded
}
```

#### Example

```json
{
  "alignment": {
    "vocab": {
      "形状": { "pinyin": "xíng zhuàng", "en": "shape" },
      "静止": { "pinyin": "jìng zhǐ",    "en": "stationary" },
      "相对": { "pinyin": "xiāng duì",   "en": "relative" },
      "平面": { "pinyin": "píng miàn",   "en": "plane" },
      "观察": { "pinyin": "guān chá",    "en": "observe" },
      "的":   { "pinyin": "de",          "en": "(possessive particle)" },
      "月亮": { "pinyin": "yuè liàng",   "en": "moon" },
      "匀速直线运动": {
        "pinyin": "yún sù zhí xiàn yùn dòng",
        "en": "uniform linear motion",
        "en_phrase": "moves in a straight line at constant speed"
      }
    },
    "explanation": {
      "vocab_zh": {
        "月亮": { "pinyin": "yuè liàng", "en": "moon" },
        "形状": { "pinyin": "xíng zhuàng", "en": "shape" },
        "变化": { "pinyin": "biàn huà", "en": "change" },
        "静止": { "pinyin": "jìng zhǐ", "en": "stationary" },
        "绕":   { "pinyin": "rào", "en": "orbit / revolve around" },
        "相对": { "pinyin": "xiāng duì", "en": "relative" },
        "位置": { "pinyin": "wèi zhì", "en": "position" },
        "不断": { "pinyin": "bù duàn", "en": "continuously" },
        "观察": { "pinyin": "guān chá", "en": "observe" },
        "平面": { "pinyin": "píng miàn", "en": "plane" }
      },
      "vocab_en": {
        "spherical":    { "zh": "球形",   "pinyin": "qiú xíng" },
        "shape":        { "zh": "形状",   "pinyin": "xíng zhuàng" },
        "stationary":   { "zh": "静止",   "pinyin": "jìng zhǐ" },
        "orbits":       { "zh": "绕行",   "pinyin": "rào xíng" },
        "relative":     { "zh": "相对",   "pinyin": "xiāng duì" },
        "position":     { "zh": "位置",   "pinyin": "wèi zhì" },
        "constantly":   { "zh": "不断",   "pinyin": "bù duàn" },
        "observe":      { "zh": "观察",   "pinyin": "guān chá" },
        "illuminated":  { "zh": "被照亮", "pinyin": "bèi zhào liàng" },
        "plane":        { "zh": "平面",   "pinyin": "píng miàn" }
      }
    }
  }
}
```

---

## API Response Shape

### `POST /api/practice` and `GET /api/sessions/{id}/questions`

```ts
interface QuestionGroup {
  group_id: string
  type: "DT" | "XT" | "YL" | "JF" | "standard"
  passage?: string                       // YL only
  passage_alignment?: Alignment          // YL only — vocab dict for passage (no explanation key)
  word_bank?: WordBankEntry[]            // DT/XT only
  questions: QuestionInGroup[]
}

interface QuestionInGroup {
  id: string
  code: string
  difficulty: string
  question_type: string
  question_number: number
  image_url?: string
  content: { zh: Record<string, any>; en: Record<string, any> }
  alignment?: Alignment                  // vocab + explanation (when answered)
  answer_state?: { selected_key: string; correct: boolean }
  explanation?: string                   // plain text; present only after question answered
  explanation_alignment?: ExplanationAlignment  // structured; present only after answered
}
```

### `POST /api/questions/{id}/submit` and `POST /api/question-groups/{id}/submit`

```ts
// Single question submit response
interface SingleSubmitResponse {
  question_id: string
  correct: boolean
  correct_answer: string
  difficulty: string
  xp_awarded: number
  explanation: string                    // plain ZH explanation (fallback)
  explanation_alignment?: ExplanationAlignment  // structured annotated explanation
}

// Group submit response (DT/XT)
interface GroupSubmitResponse {
  group_id: string
  correct: boolean
  xp_awarded: number
  results: BlankResult[]
  explanation: string                    // plain text concatenation (fallback)
  explanation_alignment?: Record<string, ExplanationAlignment>  // { question_id → annotation }
}
```

### `GET /api/sessions/{id}/review`

```ts
interface ReviewQuestion {
  id: string
  code: string
  difficulty: string
  question_type: string
  question_number: number
  image_url?: string
  content: { zh: Record<string, any>; en: Record<string, any> }
  correct_answer: string
  explanation: string                    // plain text fallback
  answer_state?: { selected_key: string; correct: boolean }
  alignment?: Alignment                  // full vocab dict for question content
  explanation_alignment?: ExplanationAlignment  // structured annotated explanation
}
```

---

## Hover Logic — Question Content

This applies to question text, answer choices, passage text. Uses `alignment.vocab`.

### ZH mode (hover Chinese → show EN + pinyin)

1. Sort vocab keys by length, **longest first** (prevents partial matches — `电场线` before `电场`).
2. Walk text with a coverage array; find all non-overlapping occurrences.
3. Wrap matched substrings in a hoverable element. Tooltip shows:
   - **EN meaning** (`en`)
   - **Pinyin** (`pinyin`)

### EN mode (hover English → show ZH + pinyin)

1. Build reverse map: `(en_phrase ?? en) → { zh: key, pinyin }`.
2. Sort by phrase length, longest first.
3. Walk EN text, case-insensitive substring match.
4. Tooltip shows:
   - **Chinese word** (the vocab key)
   - **Pinyin** (`pinyin`)

---

## Explanation Rendering

`explanation_alignment` contains two full vocab dicts — one for every ZH word in the ZH explanation, one for every EN content word in the EN explanation. Render explanation text using the same `AlignedText` component as question content; no special parser needed.

### ZH explanation hover (ZH mode)

```tsx
<AlignedText
  text={explanation_zh}
  vocab={explanation_alignment.vocab_zh ?? {}}
  mode="zh"
/>
// hover Chinese word → tooltip: EN meaning + pinyin
```

### EN explanation hover (EN mode)

`vocab_en` is keyed by English word (`{en_word: {zh, pinyin}}`). Convert it to the standard `Vocab` format before passing to `AlignedText`:

```ts
// Convert vocab_en → Vocab so AlignedText can build its reverse map normally
function vocabEnToVocab(vocabEn: Record<string, EnVocabEntry>): Vocab {
  const result: Vocab = {}
  for (const [enWord, { zh, pinyin }] of Object.entries(vocabEn)) {
    // Use the Chinese word as key; set en to the English word
    // If multiple EN words map to the same ZH word, last one wins (acceptable)
    result[zh] = { pinyin, en: enWord }
  }
  return result
}

<AlignedText
  text={explanation_en}
  vocab={vocabEnToVocab(explanation_alignment.vocab_en ?? {})}
  mode="en"
/>
// hover English word → tooltip: ZH word + pinyin
```

### Fallback when `explanation_alignment` is absent

If `explanation_alignment` is `null`, fall back to the plain `explanation` string with `alignment.vocab` for hover (which already covers explanation words since the backend includes the full explanation in vocab extraction).

```tsx
const expl = explanation_alignment

// ZH mode
{expl?.vocab_zh
  ? <AlignedText text={explanation_zh} vocab={expl.vocab_zh} mode="zh" />
  : <AlignedText text={explanation_zh} vocab={alignment?.vocab ?? {}} mode="zh" />
}

// EN mode
{expl?.vocab_en
  ? <AlignedText text={explanation_en} vocab={vocabEnToVocab(expl.vocab_en)} mode="en" />
  : <AlignedText text={explanation_en} vocab={alignment?.vocab ?? {}} mode="en" />
}
```

---

## Hover Logic — Question Content (Reference Implementation)

```ts
type Vocab = Record<string, VocabEntry>

function zhEntries(vocab: Vocab): [string, VocabEntry][] {
  return Object.entries(vocab).sort((a, b) => b[0].length - a[0].length)
}

function enEntries(vocab: Vocab): [string, { zh: string; pinyin: string }][] {
  return Object.entries(vocab)
    .filter(([, v]) => v.en)
    .map(([zh, v]) => [v.en_phrase ?? v.en, { zh, pinyin: v.pinyin }])
    .sort((a, b) => b[0].length - a[0].length)
}

function annotate(
  text: string,
  entries: [string, any][],
  caseSensitive = true,
): Array<{ text: string; match?: any }> {
  const n = text.length
  const covered: (null | { key: string; info: any; start: number; end: number })[] = new Array(n).fill(null)

  for (const [key, info] of entries) {
    const haystack = caseSensitive ? text : text.toLowerCase()
    const needle   = caseSensitive ? key  : key.toLowerCase()
    let pos = 0
    while (pos < n) {
      const idx = haystack.indexOf(needle, pos)
      if (idx === -1) break
      const conflict = covered.slice(idx, idx + key.length).some(Boolean)
      if (!conflict) {
        for (let i = idx; i < idx + key.length; i++) {
          covered[i] = { key, info, start: idx, end: idx + key.length }
        }
      }
      pos = idx + 1
    }
  }

  const segments: Array<{ text: string; match?: any }> = []
  let i = 0
  while (i < n) {
    const ann = covered[i]
    if (ann && ann.start === i) {
      segments.push({ text: text.slice(ann.start, ann.end), match: ann.info })
      i = ann.end
    } else {
      let j = i + 1
      while (j < n && !covered[j]) j++
      segments.push({ text: text.slice(i, j) })
      i = j
    }
  }
  return segments
}
```

### `AlignedText` component (question content, choices, passage)

```tsx
export function AlignedText({ text, vocab, mode }: {
  text: string; vocab: Vocab; mode: "zh" | "en"
}) {
  const entries = mode === "zh" ? zhEntries(vocab) : enEntries(vocab)
  const segments = annotate(text, entries, mode === "zh")

  return (
    <span>
      {segments.map((seg, i) =>
        seg.match ? (
          <span key={i} className="relative group cursor-default border-b border-blue-400">
            {seg.text}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-xs rounded px-3 py-1.5 whitespace-nowrap z-20 pointer-events-none text-center">
              {mode === "zh" ? (
                <><span>{seg.match.en}</span><span className="text-blue-300 mt-0.5">{seg.match.pinyin}</span></>
              ) : (
                <><span>{seg.match.zh}</span><span className="text-blue-300 mt-0.5">{seg.match.pinyin}</span></>
              )}
            </span>
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}
```

### Usage

```tsx
const vocab = question.alignment?.vocab ?? {}

// Question text
<AlignedText text={content.zh.question} vocab={vocab} mode={practiceMode} />

// YL passage
<AlignedText text={group.passage} vocab={group.passage_alignment?.vocab ?? {}} mode={practiceMode} />

// MC choices
{Object.entries(content.zh.choices ?? {}).map(([key, text]) => (
  <div key={key}>
    <span>{key}.</span>
    <AlignedText text={text as string} vocab={vocab} mode={practiceMode} />
  </div>
))}

// After submit — ZH explanation
<AlignedText
  text={explanation_zh}
  vocab={explanation_alignment?.vocab_zh ?? vocab}
  mode="zh"
/>

// After submit — EN explanation
<AlignedText
  text={explanation_en}
  vocab={vocabEnToVocab(explanation_alignment?.vocab_en ?? {})}
  mode="en"
/>
```

---

## Null / Graceful Handling

`alignment` may be `null` for newly generated questions (run in background) or when LLM extraction failed. `explanation_alignment` may be `null` even when `alignment` is present (explanation annotation is a second LLM call that can independently fail).

```ts
const vocab = question.alignment?.vocab ?? {}
// AlignedText with empty vocab renders plain text — safe fallback
```

---

## Practice Direction Toggle

The practice direction (`zh` | `en`) is a user-level preference, not per-question. Store it in global state (Zustand / Context). When toggled, re-render all `AlignedText` components — no re-fetch needed.

---

## YL Questions (Reading Comprehension)

YL questions have **two** alignment objects:
1. `group.passage_alignment` — vocab for the passage text (no `explanation` key)
2. `question.alignment` — vocab for the individual question ("According to the passage…")

Render the passage with `passage_alignment.vocab`, and each sub-question with its own `alignment.vocab`.

---

## DT/XT Group Submit — `explanation_alignment`

For group submits, `explanation_alignment` is a map keyed by `question_id`:

```ts
// GroupSubmitResponse
const alignments = response.explanation_alignment ?? {}

// Render per-question explanation
questions.forEach(q => {
  const ann = alignments[q.id]   // ExplanationAlignment | undefined
  return (
    <>
      <AlignedText
        text={q.explanation_zh}
        vocab={ann?.vocab_zh ?? vocab}
        mode="zh"
      />
      <AlignedText
        text={q.explanation_en}
        vocab={vocabEnToVocab(ann?.vocab_en ?? {})}
        mode="en"
      />
    </>
  )
})
```

---

## LaTeX Handling

Question text may contain inline LaTeX: `$R$`, `$$E = mc^2$$`.

Recommended approach:
1. Run `annotate()` on the raw string (LaTeX delimiters are preserved as plain text segments).
2. When rendering a non-matched plain segment, pass it through your LaTeX renderer (`react-katex`, `mathjax`).
3. Matched vocab spans that happen to overlap with LaTeX are rare — treat as plain text fallback.

Explanation text works the same way — `annotate()` is safe to run on raw explanation strings before LaTeX rendering.

---

## Checklist for Frontend Integration

### Vocab hover (question content)
- [ ] Add `Alignment`, `VocabEntry` TypeScript interfaces
- [ ] Implement `annotate()` with longest-first matching and coverage array
- [ ] Build `AlignedText` component (ZH + EN modes, tooltip)
- [ ] Apply to question text, answer choices, and YL passages
- [ ] Wire practice-direction toggle; re-render on change
- [ ] Handle `null` alignment gracefully (plain text fallback)
- [ ] Test with LaTeX-containing question (e.g. PH-ES-0002, PH-KM-0002)

### Explanation hover
- [ ] Add `ExplanationAlignment`, `EnVocabEntry` TypeScript interfaces
- [ ] Add `explanation_alignment` to `QuestionInGroup`, `ReviewQuestion`, submit response interfaces
- [ ] Implement `vocabEnToVocab()` — converts `vocab_en` to standard `Vocab` format for `AlignedText`
- [ ] Render ZH explanation with `<AlignedText vocab={explanation_alignment.vocab_zh} mode="zh" />`
- [ ] Render EN explanation with `<AlignedText vocab={vocabEnToVocab(explanation_alignment.vocab_en)} mode="en" />`
- [ ] For DT/XT group submit: iterate `explanation_alignment` map by `question_id`
- [ ] Fallback to `alignment.vocab` on plain explanation when `explanation_alignment` is absent

### Backend / data
- [ ] Run `py -3 scripts/run_alignment.py --recompute --limit 100` to regenerate all questions with new full-vocab + explanation annotation format
- [ ] Run `py -3 scripts/run_alignment.py --passages --recompute --limit 50` for YL passages
