import { StringStream } from "@codemirror/language";

/**
 * Keyword vocabulary, sourced from Verbose Lean 4 (English) (https://github.com/PatrickMassot/verbose-lean4).
 *
 * Matching is a word-by-word (longest possible) lookup, trying to mirror the approach of codemirror-lang-rocq.
 * Sometimes words have both casings (`By` and `by`), but only if they are potentially used both at a sentence start and mid-sentence.
 */

// Block delimiters (statement start, proof end).
const structureWords = new Set(["Example", "Exercise", "Lemma", "QED"]);

// Block headers. Tagged `param` only when followed by a colon (`Assume:`), so the bare `Assume` tactic still reads as a tactic.
const headerWords = new Set(["Given", "Assume", "Conclusion", "Proof"]);

const tacticWords = new Set([
  "and",
  "applied",
  "apply",
  "as",
  "Assume",
  "at",
  "becomes",
  "By",
  "by",
  "Calc",
  "choose",
  "Claim",
  "combine",
  "computation",
  "compute",
  "conclude",
  "contradicting",
  "contradiction",
  "contradictory",
  "contrapose",
  "contrapositive",
  "depending",
  "discuss",
  "everywhere",
  "Fact",
  "finally",
  "first",
  "Fix",
  "for",
  "forget",
  "from",
  "get",
  "help",
  "hence",
  "hypothesis",
  "induction",
  "it",
  "It",
  "it's",
  "Let's",
  "negation",
  "now",
  "observe",
  "obtain",
  "on",
  "or",
  "proceed",
  "prove",
  "push",
  "reformulate",
  "rename",
  "rewrite",
  "Set",
  "simply",
  "since",
  "Since",
  "such",
  "suffices",
  "that",
  "the",
  "to",
  "unfold",
  "using",
  "we",
  "We",
  "whether",
  "which",
  "works",
]);

export type Token =
  | "verbose"
  | "param"
  | "tactic"
  | "argument"
  | "string"
  | "comment"
  | "bracket";

export interface VerboseState {
  blockCommentDepth: number;
}

function lookupWord(word: string): Token {
  if (structureWords.has(word)) return "verbose";
  if (tacticWords.has(word)) return "tactic";
  return "argument";
}

function tokenBlockComment(stream: StringStream, state: VerboseState): Token {
  while (!stream.eol()) {
    if (stream.match("-/")) {
      state.blockCommentDepth--;
      if (state.blockCommentDepth === 0) break;
    } else if (stream.match("/-")) {
      state.blockCommentDepth++;
    } else {
      stream.next();
    }
  }
  return "comment";
}

export function token(stream: StringStream, state: VerboseState): Token | null {
  // Resume a `/- -/` block comment left open on a previous line.
  if (state.blockCommentDepth > 0) {
    return tokenBlockComment(stream, state);
  }

  if (stream.eatSpace()) return null;

  if (stream.match("--")) {
    stream.skipToEnd();
    return "comment";
  }
  if (stream.match("/-")) {
    state.blockCommentDepth = 1;
    return tokenBlockComment(stream, state);
  }

  if (stream.peek() === '"') {
    stream.next();
    let escaped = false;
    let ch: string | void;
    while ((ch = stream.next()) != null) {
      if (ch === '"' && !escaped) break;
      escaped = !escaped && ch === "\\";
    }
    return "string";
  }

  if (stream.match(/^[()[\]{}]/)) return "bracket";

  const word = stream.match(/^[\w']+/);
  if (word) {
    const text = (word as RegExpMatchArray)[0];
    if (headerWords.has(text) && stream.peek() === ":") return "param";
    return lookupWord(text);
  }

  // Operators, math symbols and numbers all fall through as plain arguments.
  if (!stream.match(/^[^\s()[\]{}"\w]+/)) stream.next();
  return "argument";
}
