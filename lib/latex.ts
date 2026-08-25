import katex from "katex";

// Matches $$...$$ (display) and $...$ (inline) math blocks.
// Display must be checked first so the longer delimiter wins.
export const MATH_RE = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;

export function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}

// Flattening markdown/LaTeX to plain text for compact rows and search previews
// deliberately lives on the SERVER (to_plain_text in services/bookmarks.py), not
// here. Search matching happens server-side, so a client-side copy meant the list
// could show a suggestion the real search then failed to find. The API returns the
// flattened string alongside the source (e.g. question_text_plain) — use that.
