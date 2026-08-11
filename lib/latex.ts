import katex from "katex";

// Matches $$...$$ (display) and $...$ (inline) math blocks.
// Display must be checked first so the longer delimiter wins.
export const MATH_RE = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;

export function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}
