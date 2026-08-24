import katex from "katex";

// Matches $$...$$ (display), $...$ (inline), \[...\] (display), \(...\) (inline).
// Longer/display delimiters are checked first so they win over shorter ones.
export const MATH_RE = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;

export function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}
