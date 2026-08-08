"use client";

import katex from "katex";
import { PRIMARY, INK, CORRECT_DARK } from "@/constants/colors";
import { rem } from "@mantine/core";

const MATH_RE = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
const BOLD_RE = /(\*\*(?:[^*]|\*(?!\*))+\*\*)/g;
const CODE_RE = /(`[^`]+`)/g;
const CIRCLE_RE = /(\{\d+\})/g;

function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}

/** Leaf: plain text only — no further parsing */
function plainText(text: string, key: string): React.ReactElement {
  return <span key={key}>{text}</span>;
}

/** Circle badge for {N} */
function CircleBadge({ n, keyStr }: { n: string; keyStr: string }) {
  return (
    <span
      key={keyStr}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: rem(22),
        height: rem(22),
        borderRadius: "50%",
        backgroundColor: "#F0F4FF",
        color: "#6670B0",
        fontSize: rem(11),
        fontWeight: 700,
        verticalAlign: "middle",
        flexShrink: 0,
        margin: `0 ${rem(2)}`,
      }}
    >
      {n}
    </span>
  );
}

/**
 * Parsing order (outermost → innermost):
 *   Math → Bold → Code → CircleNum → plain text
 *
 * Math must be outermost so {N} inside LaTeX (e.g. \frac{0.5}{4}) is never
 * seen by the circle parser.
 */
function parseMath(text: string, keyPrefix: string, circleNums: boolean): React.ReactElement[] {
  return text.split(MATH_RE).flatMap((part, i): React.ReactElement[] => {
    const key = `${keyPrefix}-m${i}`;
    if (part.startsWith("$$") && part.endsWith("$$")) {
      return [
        <span
          key={key}
          style={{ display: "block", textAlign: "center", margin: "0.3em 0" }}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }}
        />,
      ];
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return [
        <span
          key={key}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}
        />,
      ];
    }
    // Non-math segment — continue parsing
    return parseBold(part, key, circleNums);
  });
}

function parseBold(text: string, keyPrefix: string, circleNums: boolean): React.ReactElement[] {
  return text.split(BOLD_RE).flatMap((part, i): React.ReactElement[] => {
    const key = `${keyPrefix}-b${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return [<strong key={key}>{parseCode(part.slice(2, -2), key, circleNums)}</strong>];
    }
    return parseCode(part, key, circleNums);
  });
}

function parseCode(text: string, keyPrefix: string, circleNums: boolean): React.ReactElement[] {
  return text.split(CODE_RE).flatMap((part, i): React.ReactElement[] => {
    const key = `${keyPrefix}-c${i}`;
    if (part.startsWith("`") && part.endsWith("`")) {
      return [
        <span
          key={key}
          style={{
            display: "inline-block",
            backgroundColor: "#F5E6CC",
            color: CORRECT_DARK,
            borderRadius: rem(4),
            padding: `0 ${rem(6)}`,
            fontWeight: 600,
            fontSize: "0.9em",
            lineHeight: 1.5,
          }}
        >
          {part.slice(1, -1)}
        </span>,
      ];
    }
    if (circleNums) return parseCircleNum(part, key);
    return [plainText(part, key)];
  });
}

function parseCircleNum(text: string, keyPrefix: string): React.ReactElement[] {
  return text.split(CIRCLE_RE).map((part, i) => {
    const key = `${keyPrefix}-n${i}`;
    const m = part.match(/^\{(\d+)\}$/);
    if (m) return <CircleBadge key={key} n={m[1]} keyStr={key} />;
    return plainText(part, key);
  });
}

/**
 * Renders a markdown-style string with support for:
 * - **bold** text
 * - `inline code` (rendered as amber highlight chip)
 * - $inline$ and $$display$$ LaTeX math
 * - > blockquote lines (rendered as highlighted answer box)
 * - Paragraphs separated by blank lines
 * - Line breaks within paragraphs
 * - {N} circle number badges (opt-in via circleNums prop)
 */
export function MarkdownLatexText({ children, circleNums = false }: { children: string; circleNums?: boolean }) {
  const blocks = children.split(/\n\n+/);

  return (
    <div style={{ lineHeight: 1.8, color: INK }}>
      {blocks.map((block, bi) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("> ")) {
          const content = trimmed.slice(2);
          return (
            <div
              key={bi}
              style={{
                margin: "0.75em 0",
                padding: `${rem(10)} ${rem(14)}`,
                backgroundColor: "#F5E6CC",
                borderLeft: `3px solid ${PRIMARY}`,
                borderRadius: rem(6),
                fontWeight: 700,
                color: CORRECT_DARK,
              }}
            >
              {parseMath(content, `bq${bi}`, circleNums)}
            </div>
          );
        }

        const lines = trimmed.split("\n");
        return (
          <p key={bi} style={{ margin: "0 0 0.6em 0" }}>
            {lines.map((line, li) => (
              <span key={li} style={{ display: "contents" }}>
                {li > 0 && <br />}
                {parseMath(line, `p${bi}l${li}`, circleNums)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
