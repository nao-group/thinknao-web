"use client";

/**
 * AlignedText — renders text with hoverable vocab spans.
 *
 * ZH mode: hover a Chinese word to see its English meaning + pinyin.
 * EN mode: hover an English phrase to see the Chinese word + pinyin.
 *
 * All data comes from the pre-computed `alignment.vocab` object shipped with
 * each question/group — no runtime translation calls are made.
 */

import { useState } from "react";
import { rem } from "@mantine/core";
import { MATH_RE, renderMath } from "@/lib/latex";
import { INK } from "@/constants/colors";
import type { Vocab, VocabEntry } from "../types";

// ─── Annotation helpers ───────────────────────────────────────────────────────

type ZhMatch = VocabEntry;
type EnMatch = { zh: string; pinyin: string };

/** Returns vocab entries sorted longest-first to prevent partial-substring collisions. */
function zhEntries(vocab: Vocab): [string, ZhMatch][] {
  return Object.entries(vocab).sort((a, b) => b[0].length - a[0].length);
}

/** Builds a reverse map (en phrase → { zh, pinyin }), sorted longest-first. */
function enEntries(vocab: Vocab): [string, EnMatch][] {
  return Object.entries(vocab)
    .filter(([, v]) => v.en)
    .map(([zh, v]) => [v.en_phrase ?? v.en, { zh, pinyin: v.pinyin }] as [string, EnMatch])
    .sort((a, b) => b[0].length - a[0].length);
}

/**
 * Annotates `text` with vocab matches using a coverage array so matches never
 * overlap. Returns an array of segments: plain text or matched vocab.
 */
function annotate(
  text: string,
  entries: [string, ZhMatch | EnMatch][],
  caseSensitive: boolean,
): Array<{ text: string; match?: ZhMatch | EnMatch }> {
  const n = text.length;
  const covered: (null | { info: ZhMatch | EnMatch; start: number; end: number })[] =
    new Array(n).fill(null);

  for (const [key, info] of entries) {
    const haystack = caseSensitive ? text : text.toLowerCase();
    const needle   = caseSensitive ? key  : key.toLowerCase();
    let pos = 0;
    while (pos < n) {
      const idx = haystack.indexOf(needle, pos);
      if (idx === -1) break;
      const conflict = covered.slice(idx, idx + key.length).some(Boolean);
      if (!conflict) {
        for (let i = idx; i < idx + key.length; i++) {
          covered[i] = { info, start: idx, end: idx + key.length };
        }
      }
      pos = idx + 1;
    }
  }

  const segments: Array<{ text: string; match?: ZhMatch | EnMatch }> = [];
  let i = 0;
  while (i < n) {
    const ann = covered[i];
    if (ann && ann.start === i) {
      segments.push({ text: text.slice(ann.start, ann.end), match: ann.info });
      i = ann.end;
    } else {
      let j = i + 1;
      while (j < n && !covered[j]) j++;
      segments.push({ text: text.slice(i, j) });
      i = j;
    }
  }
  return segments;
}

// ─── Inline segment renderer (handles LaTeX, preserves plain text) ─────────────

function renderInlineSegment(text: string, keyPrefix: string): React.ReactElement[] {
  return text.split(MATH_RE).map((part, i) => {
    const k = `${keyPrefix}-m${i}`;
    if (part.startsWith("$$") && part.endsWith("$$")) {
      return (
        <span
          key={k}
          style={{ display: "block", textAlign: "center", margin: "0.3em 0" }}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }}
        />
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span
          key={k}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}
        />
      );
    }
    return <span key={k}>{part}</span>;
  });
}

// ─── Vocab span with tooltip ──────────────────────────────────────────────────

function VocabSpan({
  text,
  match,
  mode,
}: {
  text: string;
  match: ZhMatch | EnMatch;
  mode: "zh" | "en";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        style={{
          cursor: "default",
          borderRadius: rem(3),
          padding: `0 ${rem(1)}`,
          backgroundColor: visible ? "rgba(147,197,253,0.25)" : "transparent",
          transition: "background-color 120ms ease",
        }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {text}
      </span>
      {visible && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: INK,
            color: "white",
            borderRadius: rem(8),
            padding: `${rem(6)} ${rem(12)}`,
            whiteSpace: "nowrap",
            zIndex: 50,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: rem(3),
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          {mode === "zh" ? (
            <>
              <span style={{ fontSize: rem(13), fontWeight: 600 }}>
                {(match as ZhMatch).en}
              </span>
              {(match as ZhMatch).pinyin && (
                <span style={{ fontSize: rem(11), color: "#93C5FD" }}>
                  {(match as ZhMatch).pinyin}
                </span>
              )}
            </>
          ) : (
            <>
              <span style={{ fontSize: rem(13), fontWeight: 600 }}>
                {(match as EnMatch).zh}
              </span>
              {(match as EnMatch).pinyin && (
                <span style={{ fontSize: rem(11), color: "#93C5FD" }}>
                  {(match as EnMatch).pinyin}
                </span>
              )}
            </>
          )}
        </span>
      )}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AlignedTextProps {
  text: string;
  vocab: Vocab;
  mode: "zh" | "en";
  /**
   * When true, newlines in `text` are rendered as <br> elements.
   * Use for passages that have multi-line content.
   */
  multiline?: boolean;
}

/**
 * Renders `text` with hoverable vocab spans derived from the alignment vocab
 * dictionary. Falls back to plain text rendering when `vocab` is empty.
 *
 * Non-matched segments are rendered through the inline LaTeX renderer so that
 * math expressions (`$...$`, `$$...$$`) display correctly.
 */
export function AlignedText({ text, vocab, mode, multiline = false }: AlignedTextProps) {
  const entries = mode === "zh"
    ? (zhEntries(vocab) as [string, ZhMatch | EnMatch][])
    : (enEntries(vocab) as [string, ZhMatch | EnMatch][]);
  const caseSensitive = mode === "zh";

  function renderLine(line: string, lineKey: string): React.ReactElement[] {
    const segments = annotate(line, entries, caseSensitive);
    return segments.flatMap((seg, si) => {
      const key = `${lineKey}-s${si}`;
      if (seg.match) {
        return [
          <VocabSpan key={key} text={seg.text} match={seg.match} mode={mode} />,
        ];
      }
      return renderInlineSegment(seg.text, key);
    });
  }

  if (multiline) {
    const lines = text.split("\n");
    return (
      <span>
        {lines.flatMap((line, li) => {
          const nodes = renderLine(line, `l${li}`);
          if (li === 0) return nodes;
          return [<br key={`br${li}`} />, ...nodes];
        })}
      </span>
    );
  }

  return <span>{renderLine(text, "l0")}</span>;
}
