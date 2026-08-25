import katex from "katex";

// Matches $$...$$ (display), $...$ (inline), \[...\] (display), \(...\) (inline).
// Longer/display delimiters are checked first so they win over shorter ones.
export const MATH_RE = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\([\s\S]+?\\\))/g;

export function renderMath(latex: string, display: boolean): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: display });
}

// Flattening markdown/LaTeX to plain text for compact rows and search previews
// deliberately lives on the SERVER (to_plain_text in services/bookmarks.py), not
// here. Search matching happens server-side, so a client-side copy meant the list
// could show a suggestion the real search then failed to find. The API returns the
// flattened string alongside the source (e.g. question_text_plain) — use that.
