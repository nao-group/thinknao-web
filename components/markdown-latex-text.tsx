"use client";

import katex from "katex";
import { PRIMARY, INK, CORRECT_DARK } from "@/constants/colors";
import { rem } from "@mantine/core";

const MATH_RE = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
const BOLD_RE = /(\*\*(?:[^*]|\*(?!\*))+\*\*)/g;

function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}

function parseMath(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(MATH_RE).map((part, i) => {
    const key = `${keyPrefix}-m${i}`;
    if (part.startsWith("$$") && part.endsWith("$$")) {
      return (
        <span
          key={key}
          style={{ display: "block", textAlign: "center", margin: "0.3em 0" }}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(2, -2), true) }}
        />
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      return (
        <span
          key={key}
          dangerouslySetInnerHTML={{ __html: renderMath(part.slice(1, -1), false) }}
        />
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(BOLD_RE).flatMap((part, i) => {
    const key = `${keyPrefix}-b${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return [<strong key={key}>{parseMath(part.slice(2, -2), key)}</strong>];
    }
    return parseMath(part, key);
  });
}

/**
 * Renders a markdown-style string with support for:
 * - **bold** text
 * - $inline$ and $$display$$ LaTeX math
 * - > blockquote lines (rendered as highlighted answer box)
 * - Paragraphs separated by blank lines
 * - Line breaks within paragraphs
 */
export function MarkdownLatexText({ children }: { children: string }) {
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
              {parseInline(content, `bq${bi}`)}
            </div>
          );
        }

        const lines = trimmed.split("\n");
        return (
          <p key={bi} style={{ margin: "0 0 0.6em 0" }}>
            {lines.map((line, li) => (
              <span key={li} style={{ display: "contents" }}>
                {li > 0 && <br />}
                {parseInline(line, `p${bi}l${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
