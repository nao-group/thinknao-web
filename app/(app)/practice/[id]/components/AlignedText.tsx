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

import { useState, isValidElement, cloneElement } from "react";
import { rem } from "@mantine/core";
import { splitMath, renderMath } from "@/lib/latex";
import { INK } from "@/constants/colors";
import { renderInlineMarkdown } from "@/components/markdown-latex-text";
import type { Vocab, VocabEntry } from "../types";

// NOTE: LaTeX spans are extracted BEFORE vocab annotation runs.
// This prevents English vocab phrases from accidentally matching inside math
// expressions (e.g. "cos x" matching inside "$\cos x$" in EN mode).

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

// ─── Placeholder expansion (markdown-first rendering) ────────────────────────

// \x00N\x00 = vocab placeholder, \x01 = newline placeholder
const VOCAB_PH_RE = /(\x00\d+\x00|\x01)/;

/**
 * Recursively walks React nodes produced by the markdown parser and replaces:
 * - `\x00N\x00` with the corresponding VocabSpan element
 * - `\x01` with a `<br>` element
 *
 * This lets us parse bold/italic BEFORE vocab annotation, so markers like
 * `**text (反函数) more**` survive intact through the markdown pass.
 * `\x01` is used instead of `\n` so bold can span original line breaks without
 * the italic regex's `[^*\n]` guard treating them as unterminated markers.
 */
function expandVocabPlaceholders(
  node: React.ReactNode,
  vocabMap: Map<string, React.ReactElement>,
  keyBase: string,
): React.ReactNode {
  if (typeof node === "string") {
    if (!node.includes("\x00") && !node.includes("\x01")) return node;
    return node.split(VOCAB_PH_RE).map((part, i) => {
      if (part === "\x01") return <br key={`${keyBase}-br${i}`} />;
      const vocab = vocabMap.get(part);
      return vocab ? cloneElement(vocab, { key: `${keyBase}-ph${i}` }) : part;
    });
  }
  if (Array.isArray(node)) {
    return node.map((child, i) =>
      expandVocabPlaceholders(child, vocabMap, `${keyBase}-arr${i}`)
    );
  }
  if (isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    const { children } = el.props;
    if (children == null) return node;
    return cloneElement(el, {}, expandVocabPlaceholders(children, vocabMap, `${keyBase}-ch`));
  }
  return node;
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
  /**
   * When true, enables block-level rendering: paragraphs (split on blank lines),
   * line breaks, and `>` blockquote lines. Use for explanation text.
   */
  block?: boolean;
}

/**
 * Renders `text` with hoverable vocab spans derived from the alignment vocab
 * dictionary. Falls back to plain text rendering when `vocab` is empty.
 *
 * LaTeX spans are extracted first (before vocab annotation), then non-matched
 * plain text is rendered with inline markdown support (bold, italic, etc.).
 */
export function AlignedText({ text, vocab, mode, multiline = false, block = false }: AlignedTextProps) {
  const entries = mode === "zh"
    ? (zhEntries(vocab) as [string, ZhMatch | EnMatch][])
    : (enEntries(vocab) as [string, ZhMatch | EnMatch][]);
  const caseSensitive = mode === "zh";

  function renderLine(line: string, lineKey: string): React.ReactElement[] {
    // 1. Split on LaTeX first — never run vocab matching inside math spans
    return splitMath(line).flatMap((mathPart, pi) => {
      const pk = `${lineKey}-p${pi}`;
      if (mathPart.startsWith("$$") && mathPart.endsWith("$$")) {
        return [
          <span
            key={pk}
            style={{ display: "block", textAlign: "center", margin: "0.3em 0" }}
            dangerouslySetInnerHTML={{ __html: renderMath(mathPart.slice(2, -2), true) }}
          />,
        ];
      }
      if (mathPart.startsWith("$") && mathPart.endsWith("$")) {
        return [
          <span
            key={pk}
            dangerouslySetInnerHTML={{ __html: renderMath(mathPart.slice(1, -1), false) }}
          />,
        ];
      }

      // 2. Annotate to find vocab matches; replace them with \x00N\x00 placeholders
      //    so that bold/italic markers spanning a vocab word survive the markdown pass.
      const rawSegments = annotate(mathPart, entries, caseSensitive);
      const vocabMap = new Map<string, React.ReactElement>();
      let phIdx = 0;
      let placeholderText = "";
      for (const seg of rawSegments) {
        if (seg.match) {
          const ph = `\x00${phIdx}\x00`;
          vocabMap.set(ph, <VocabSpan text={seg.text} match={seg.match} mode={mode} />);
          placeholderText += ph;
          phIdx++;
        } else {
          placeholderText += seg.text;
        }
      }

      // 3. Parse bold/italic on placeholder text, then expand placeholders back to VocabSpan
      const mdNodes = renderInlineMarkdown(placeholderText, pk);
      if (vocabMap.size === 0) return mdNodes;
      return mdNodes.map((el, i) =>
        cloneElement(
          expandVocabPlaceholders(el, vocabMap, `${pk}-e${i}`) as React.ReactElement,
          { key: `${pk}-e${i}` },
        )
      );
    });
  }

  /**
   * Processes a paragraph (may contain `\n`) as a single unit so that bold/italic
   * markers spanning line breaks — or wrapping LaTeX — are parsed correctly.
   *
   * Pipeline:
   *   1. splitMath protects LaTeX from vocab annotation while keeping it inline.
   *   2. Vocab matches outside LaTeX are replaced with \x00N\x00 placeholders.
   *   3. \n → \x01 so bold/italic regexes can span original line breaks.
   *   4. renderInlineMarkdown handles bold → italic → math in the right order.
   *   5. expandVocabPlaceholders injects VocabSpan and <br> at the leaf level.
   */
  function buildParagraphNodes(para: string, paraKey: string): React.ReactElement[] {
    const vocabMap = new Map<string, React.ReactElement>();
    let phIdx = 0;
    let placeholderText = "";

    for (const part of splitMath(para)) {
      const isBlock = part.startsWith("$$") && part.endsWith("$$");
      const isInline = !isBlock && part.startsWith("$") && part.endsWith("$");
      if (isBlock || isInline) {
        placeholderText += part; // kept verbatim for parseMath inside renderInlineMarkdown
      } else {
        const segs = annotate(part, entries, caseSensitive);
        for (const seg of segs) {
          if (seg.match) {
            const ph = `\x00${phIdx}\x00`;
            vocabMap.set(ph, <VocabSpan text={seg.text} match={seg.match} mode={mode} />);
            placeholderText += ph;
            phIdx++;
          } else {
            placeholderText += seg.text;
          }
        }
      }
    }

    // Replace \n with \x01 so bold/italic can span original line breaks
    const mdText = placeholderText.replace(/\n/g, "\x01");
    const mdNodes = renderInlineMarkdown(mdText, paraKey);

    if (vocabMap.size === 0 && !mdText.includes("\x01")) return mdNodes;
    return mdNodes.map((el, i) =>
      cloneElement(
        expandVocabPlaceholders(el, vocabMap, `${paraKey}-e${i}`) as React.ReactElement,
        { key: `${paraKey}-e${i}` },
      )
    );
  }

  if (block) {
    const paragraphs = text.split(/\n{2,}/);
    return (
      <div>
        {paragraphs.map((para, pi) => {
          const marginBottom = pi < paragraphs.length - 1 ? "0.75em" : 0;
          const lines = para.split(/\r?\n/);
          const allQuote = lines.length > 0 && lines.every((l) => l.trimStart().startsWith(">"));

          if (allQuote) {
            const stripped = lines.map((l) => l.replace(/^>\s?/, "")).join("\n");
            return (
              <div
                key={`para${pi}`}
                style={{
                  borderLeft: "3px solid #94A3B8",
                  backgroundColor: "#F8FAFC",
                  borderRadius: rem(4),
                  padding: `${rem(6)} ${rem(12)}`,
                  margin: `${rem(4)} 0 ${marginBottom}`,
                  color: "#475569",
                  fontStyle: "italic",
                }}
              >
                {buildParagraphNodes(stripped, `q${pi}`)}
              </div>
            );
          }

          return (
            <div key={`para${pi}`} style={{ marginBottom }}>
              {buildParagraphNodes(para, `p${pi}`)}
            </div>
          );
        })}
      </div>
    );
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
