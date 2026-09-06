# Practice & Exam API — Frontend Integration Guide

All endpoints (except debug) require a Bearer token:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/subjects` | List all subjects |
| `GET` | `/api/subjects/{subject_code}/topics` | List topics for a subject |
| `POST` | `/api/practice` | Start a new practice session |
| `POST` | `/api/exam` | Start a new mock exam session *(not yet implemented)* |
| `GET` | `/api/sessions` | List sessions — practice and/or exam (paginated) |
| `GET` | `/api/sessions/{session_id}/questions` | Continue a session — questions + answered state |
| `GET` | `/api/sessions/{session_id}/review` | Review a session — questions + correct answers + explanations |
| `PATCH` | `/api/sessions/{session_id}/name` | Rename a session |
| `PATCH` | `/api/sessions/{session_id}/complete` | Mark a session as completed |
| `POST` | `/api/questions/{question_id}/submit` | Submit answer for a single question (JF / YL) |
| `POST` | `/api/question-groups/{group_id}/submit` | Submit answers for a whole group (DT / XT) |

---

## Question Types

| Type | Description | Has word bank | Has passage | Submit via |
|------|-------------|:---:|:---:|------------|
| `DT` | Paragraph with `{N}` fill-in-the-blank placeholders | ✓ | — | Group submit |
| `XT` | Set of sentences, each with one `____` blank | ✓ | — | Group submit |
| `YL` | Reading passage + multiple-choice questions | — | ✓ | Single submit |
| `JF` | Standard multiple-choice | — | — | Single submit |

---

## GET `/api/subjects`

Returns all subjects, ordered by name.

**Response `200`**

```json
{
  "subjects": [
    { "id": "uuid", "name": "Humanities Chinese", "code": "WH" },
    { "id": "uuid", "name": "Physics",              "code": "PH" },
    { "id": "uuid", "name": "STEM Chinese",      "code": "LH" }
  ]
}
```

---

## GET `/api/subjects/{subject_code}/topics`

Returns the topic list for a subject. Use the returned `topic_id` to start a practice session.

**Path params**

| Param | Example |
|-------|---------|
| `subject_code` | `WH`, `LH`, `PH`, `CM`, `MT` |

**Response `200`**

```json
{
  "subject_code": "WH",
  "topics": [
    { "id": "uuid", "name": "Reading Comprehension",              "code": "WH-YL" },
    { "id": "uuid", "name": "Multiple Choice",                    "code": "WH-JF" },
    { "id": "uuid", "name": "Fill-in-the-Blank (Paragraph)",      "code": "WH-DT" },
    { "id": "uuid", "name": "Fill-in-the-Blank (Shared Choices)", "code": "WH-XT" }
  ]
}
```

---

## POST `/api/practice`

Starts a new practice session. Returns a `session_id` and the full grouped question set.

**Request body**

```json
{
  "topic_id": "9048ee4b-1d7c-4fb5-ad8c-906e6028ebd3",
  "n": 10
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `topic_id` | UUID | required | From topics list |
| `n` | int | `10` | Number of sub-questions to request. For grouped types (DT/XT/YL) this is rounded up to the nearest complete group. |

**Response `200`**

```json
{
  "session_id": "uuid",
  "topic_id": "uuid",
  "mastery": 0.42,
  "ratio": { "easy": 0.6, "medium": 0.3, "hard": 0.1 },
  "shortfall": {},
  "total_groups": 3,
  "groups": [ ... ]
}
```

> `shortfall` is empty when the question bank was large enough. Non-empty means some difficulty slots could not be filled (AI generation attempted first).

**Group object**

```json
{
  "group_id": "LH-XT-0004",
  "type": "XT",
  "passage": null,
  "word_bank": [
    { "key": "A", "text": "系统" },
    { "key": "B", "text": "沉淀" },
    { "key": "C", "text": "重力" },
    { "key": "D", "text": "合力" },
    { "key": "E", "text": "体积" },
    { "key": "F", "text": "步骤" }
  ],
  "questions": [ ... ]
}
```

| Field | Present for |
|-------|------------|
| `word_bank` | `DT`, `XT` — shared across all questions in the group |
| `passage` | `YL` — reading text shown above the questions |

**Question object (inside `questions[]`)**

```json
{
  "id": "uuid",
  "code": "LH-XT-0003-0004",
  "difficulty": "easy",
  "question_type": "XT",
  "question_number": 3,
  "image_url": null,
  "content": {
    "zh": {
      "question": {
        "1": "树上的苹果向下跌落，是因为____在起作用。",
        "2": "物体运动的方向受____影响。"
      }
    },
    "en": {
      "question": {
        "1": "The apple on the tree falls downward because ____ is at work.",
        "2": "The direction of an object's motion is influenced by ____."
      }
    }
  }
}
```

> For **JF** and **YL**, `content.zh` and `content.en` also contain an `options` object (the answer choices):
> ```json
> "options": { "A": "读书会", "B": "足球赛", "C": "卖东西", "D": "看电影" }
> ```
> For **DT** and **XT**, options are in `word_bank` at the group level — not repeated per question.

> `question_number` is 1-based and continuous across the whole session (e.g. questions 1–5 belong to group 1, questions 6–10 belong to group 2).

---

## POST `/api/exam`

> **Not yet implemented — returns `501`.**

Starts a new mock exam session. The system auto-selects a mix of questions matching real exam rules for the chosen subject.

**Request body**

```json
{
  "subject_code": "WH",
  "language": null
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `subject_code` | string | required | Subject to examine on (e.g. `WH`, `MT`, `PH`) |
| `language` | string | `null` | `"zh"` or `"en"` — only applicable for Math (`MT`), Physics (`PH`), and Chemistry (`CM`). Ignored for language subjects. |

**Response `200`** *(planned)*

```json
{
  "session_id": "uuid",
  "subject_code": "WH",
  "total_groups": 12,
  "time_limit_minutes": 80,
  "groups": [ ... ]
}
```

> `groups` follows the same structure as the practice session response.
> The exam timer starts the moment this response is received.

---

## GET `/api/sessions`

Returns a paginated list of the authenticated student's sessions (practice and/or exam), newest first.

**Query params**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `page_size` | int | `20` | Items per page |
| `type` | string | — | `practice` or `mock_exam` — omit to return all |
| `subject_codes` | string (repeatable) | — | Filter by subject code(s). Repeat the param for multiple: `?subject_codes=WH&subject_codes=LH` |
| `status` | string | — | `in_progress` or `completed` |
| `search` | string | — | Case-insensitive search on session name |

**Response `200`**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "name": "Humanities Chinese 3",
      "status": "in_progress",
      "type": "practice",
      "topic_id": "uuid",
      "subject_id": "uuid",
      "subject_name": "Humanities Chinese",
      "subject_code": "WH",
      "topic_name": "Reading Comprehension",
      "topic_code": "WH-YL",
      "created_at": "2026-08-08T10:00:00+00:00"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

> `type` is `"practice"` or `"mock_exam"`.
> `topic_id`, `topic_name`, `topic_code` are `null` for mock exam sessions (which span a whole subject, not a single topic).

---

## PATCH `/api/sessions/{session_id}/name`

Rename a session. Only the session owner can rename it.

**Request body**

```json
{ "name": "My Custom Name" }
```

**Response `200`**

```json
{ "id": "uuid", "name": "My Custom Name" }
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | Session not found or not owned by the current user |

---

## PATCH `/api/sessions/{session_id}/complete`

Mark a session as `completed`. Call this when the student finishes all questions in the session.

**Request body** — none required.

**Response `200`**

```json
{ "id": "uuid", "status": "completed" }
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | Session not found or not owned by the current user |

---

## GET `/api/sessions/{session_id}/questions`

Use this when the student taps **Continue** on an `in_progress` session. Returns all groups with each question's `answer_state` pre-filled for already-answered questions, so the UI can restore exactly where the student left off.

**Response `200`**

```json
{
  "session_id": "uuid",
  "status": "in_progress",
  "total_groups": 2,
  "answered_count": 5,
  "total_count": 10,
  "groups": [
    {
      "group_id": "WH-YL-0001",
      "type": "YL",
      "passage": "社区图书馆就在小区里...",
      "word_bank": null,
      "answered": true,
      "questions": [
        {
          "id": "uuid",
          "code": "WH-YL-0001-0001",
          "difficulty": "easy",
          "question_type": "YL",
          "question_number": 1,
          "image_url": null,
          "content": { "zh": { ... }, "en": { ... } },
          "answer_state": { "selected_key": "B", "correct": true }
        },
        {
          "id": "uuid",
          "code": "WH-YL-0002-0001",
          "difficulty": "easy",
          "question_type": "YL",
          "question_number": 2,
          "image_url": null,
          "content": { "zh": { ... }, "en": { ... } },
          "answer_state": null
        }
      ]
    }
  ]
}
```

> `answer_state` is `null` for questions the student hasn't answered yet.
> `answered` on the group is `true` only when **every** question in the group has an `answer_state`.
> `answered_count` / `total_count` can drive a progress bar.

**Errors**

| Code | Reason |
|------|--------|
| `404` | Session not found |

---

## GET `/api/sessions/{session_id}/review`

Use this when the student opens a **completed** session to review results. Returns all questions with correct answers, explanations, and the student's original answer highlighted.

**Response `200`**

```json
{
  "session_id": "uuid",
  "session_name": "Humanities Chinese 3",
  "status": "completed",
  "total_groups": 2,
  "total_count": 10,
  "score": 8,
  "incorrect_count": 1,
  "skipped_count": 1,
  "xp_earned": 74.5,
  "groups": [
    {
      "group_id": "WH-YL-0001",
      "type": "YL",
      "passage": "社区图书馆就在小区里...",
      "word_bank": null,
      "questions": [
        {
          "id": "uuid",
          "code": "WH-YL-0001-0001",
          "difficulty": "easy",
          "question_type": "YL",
          "question_number": 1,
          "image_url": null,
          "content": { "zh": { ... }, "en": { ... } },
          "correct_answer": "A",
          "explanation": "社区图书馆可以参加读书会...",
          "answer_state": { "selected_key": "B", "correct": false }
        }
      ]
    }
  ]
}
```

> `correct_answer` — highlight this in green in the UI.
> `answer_state.selected_key` — highlight this in red if `correct` is `false`.
> `answer_state` is `null` if the student skipped the question without submitting.
> `score` / `total_count` can render the summary card (e.g. "8 / 10 correct").
> `xp_earned` is the total XP awarded across all questions in this session.

**Errors**

| Code | Reason |
|------|--------|
| `404` | Session not found |

---

## POST `/api/questions/{question_id}/submit`

Submit a single answer for a **JF** or **YL** question. Call once per question.

**Path params**

| Param | Example |
|-------|---------|
| `question_id` | UUID from `questions[].id` |

**Request body**

```json
{ "session_id": "uuid", "selected_key": "A" }
```

**Response `200`**

```json
{
  "question_id": "uuid",
  "correct": true,
  "correct_answer": "A",
  "difficulty": "easy",
  "xp_awarded": 9.5,
  "explanation": "社区图书馆可以参加读书会、讲故事等活动。"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `404` | Question not found |

---

## POST `/api/question-groups/{group_id}/submit`

Submit all blank answers for a **DT** or **XT** group at once. The whole group is evaluated together.

**Path params**

| Param | Example |
|-------|---------|
| `group_id` | `group_id` from the group object, e.g. `LH-XT-0004` |

**Request body**

`answers` is a map of `question_id → { "1": selected_key }`. The blank index is always `"1"` since each question row has exactly one blank.

```json
{
  "session_id": "uuid",
  "answers": {
    "uuid-q1": { "1": "C" },
    "uuid-q2": { "1": "D" },
    "uuid-q3": { "1": "B" },
    "uuid-q4": { "1": "F" },
    "uuid-q5": { "1": "E" }
  }
}
```

> Include every `question_id` in the group. Missing IDs count as unanswered (empty string, marked incorrect).

**Response `200`**

```json
{
  "group_id": "LH-XT-0004",
  "correct": false,
  "xp_awarded": 14.25,
  "results": [
    {
      "question_id": "uuid-q1",
      "blank_index": "1",
      "correct": true,
      "correct_answer": "C",
      "user_answer": "C"
    },
    {
      "question_id": "uuid-q2",
      "blank_index": "1",
      "correct": false,
      "correct_answer": "D",
      "user_answer": "A"
    }
  ],
  "explanation": "重力是地球对物体的引力...\n\n合力决定物体运动方向..."
}
```

> `correct` at the group level is `true` only when **every** blank is correct.
> `explanation` contains all per-question explanations joined by a blank line, in question order.

**Errors**

| Code | Reason |
|------|--------|
| `404` | Group not found |

---

## Typical Flow

### Practice session

```
1. GET  /api/subjects/{subject_code}/topics
        → pick a topic_id

2. POST /api/practice  { topic_id, n }
        → receive session_id + groups[]
        → session auto-named e.g. "Humanities Chinese 3"
        → render questions grouped by group_id

3a. For each JF / YL question the user answers:
    POST /api/questions/{question_id}/submit  { session_id, selected_key }
    → answer saved to session; show correct/incorrect + explanation

3b. For each DT / XT group when the user finishes all blanks:
    POST /api/question-groups/{group_id}/submit  { session_id, answers: { qid: { "1": key } } }
    → answers saved to session; show per-blank results + explanation

4. When the student finishes all groups:
   PATCH /api/sessions/{session_id}/complete
   → status transitions in_progress → completed
```

### Resume / review

```
5. Student taps "Continue" on an in_progress session:
   GET /api/sessions/{session_id}/questions
   → returns all groups; already-answered questions have answer_state filled
   → UI restores progress without re-sampling

6. Student opens a completed session for review:
   GET /api/sessions/{session_id}/review
   → returns all questions with correct_answer + explanation + student's answer_state
   → UI highlights correct (green) / wrong (red) answers
```

### Session history screen

```
7. GET /api/sessions?type=practice&status=completed&page=1
   GET /api/sessions?type=mock_exam&page=1
   GET /api/sessions                              ← all types together

   PATCH /api/sessions/{session_id}/name  { "name": "Custom Name" }
```

---

## Error Responses

All errors follow this shape:

```json
{ "detail": "Human-readable error message." }
```

| Code | Meaning |
|------|---------|
| `401` | Missing, invalid, or expired Bearer token |
| `404` | Resource not found (topic / session / question / group) |
| `501` | Endpoint exists but is not yet implemented |
