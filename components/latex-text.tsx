"use client";

import { MATH_RE, renderMath } from "@/lib/latex";

/**
 * Renders a string that may contain LaTeX math delimited by $...$ (inline)
 * or $$...$$ (display/block). Plain text segments are rendered as-is.
 */
export function LatexText({ children }: { children: string }) {
  const segments = children.split(MATH_RE);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.startsWith("$$") && seg.endsWith("$$")) {
          return (
            <span
              key={i}
              style={{ display: "block", textAlign: "center", margin: "0.5em 0" }}
              dangerouslySetInnerHTML={{ __html: renderMath(seg.slice(2, -2), true) }}
            />
          );
        }
        if (seg.startsWith("$") && seg.endsWith("$")) {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: renderMath(seg.slice(1, -1), false) }}
            />
          );
        }
        return <span key={i}>{seg}</span>;
      })}
    </>
  );
}
