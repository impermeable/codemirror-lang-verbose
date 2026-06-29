import { describe, expect, test } from "@jest/globals";
import { StringStream } from "@codemirror/language";

import { verbose } from "../src/index";
import { token, Token, VerboseState } from "../src/tokenizer";

// Tokenize a single line into `(text, token)` pairs, driving the tokenizer directly (StreamLanguage exposes no inspectable token stream).
function tokenizeLine(
  line: string,
  state: VerboseState = { blockCommentDepth: 0 },
): [text: string, token: Token | null][] {
  const stream = new StringStream(line, 4, 2);
  const result: [string, Token | null][] = [];
  while (!stream.eol()) {
    const start = stream.pos;
    const tok = token(stream, state);
    if (stream.pos === start) stream.next(); // guard against a non-advancing token
    const text = line.slice(start, stream.pos);
    if (text.trim() !== "" || tok !== null) result.push([text, tok]);
  }
  return result;
}

// The token assigned to a standalone word.
function kindOf(word: string): Token | null {
  return tokenizeLine(word)[0]?.[1] ?? null;
}

describe("keyword classification", () => {
  test.each(["Example", "Exercise", "Lemma", "QED"])(
    "%s is structural ('verbose')",
    (word) => expect(kindOf(word)).toBe("verbose"),
  );

  test.each(["Given", "Assume", "Conclusion", "Proof"])(
    "%s: is a block header ('param') when followed by a colon",
    (word) => expect(kindOf(`${word}:`)).toBe("param"),
  );

  test.each([
    "Fix",
    "By",
    "We",
    "Since",
    "Claim",
    "Fact",
    "Set",
    "Calc",
    "rewrite",
    "using",
    "conclude",
    "suffices",
    "discuss",
  ])("%s is a tactic", (word) => expect(kindOf(word)).toBe("tactic"));

  // Keywords that occur both at a sentence start and mid-sentence.
  test.each(["We", "we", "By", "by", "It", "it", "Since", "since"])(
    "%s is recognised in both casings",
    (word) => expect(kindOf(word)).toBe("tactic"),
  );

  test.each(["Lorem", "ipsum", "foo123"])(
    "%s is an unknown word ('argument')",
    (word) => expect(kindOf(word)).toBe("argument"),
  );

  test("'Assume' without a colon is the tactic, not a header", () => {
    expect(kindOf("Assume")).toBe("tactic");
  });
});

describe("sentence tokenization", () => {
  test("We compute", () => {
    expect(tokenizeLine("We compute")).toStrictEqual([
      ["We", "tactic"],
      ["compute", "tactic"],
    ]);
  });

  test("Assume that 0 < n", () => {
    expect(tokenizeLine("Assume that 0 < n")).toStrictEqual([
      ["Assume", "tactic"],
      ["that", "tactic"],
      ["0", "argument"],
      ["<", "argument"],
      ["n", "argument"],
    ]);
  });

  test("By h applied to x we get h0", () => {
    expect(tokenizeLine("By h applied to x we get h0")).toStrictEqual([
      ["By", "tactic"],
      ["h", "argument"],
      ["applied", "tactic"],
      ["to", "tactic"],
      ["x", "argument"],
      ["we", "tactic"],
      ["get", "tactic"],
      ["h0", "argument"],
    ]);
  });

  test("unrecognised words are all arguments", () => {
    expect(tokenizeLine("Lorem ipsum")).toStrictEqual([
      ["Lorem", "argument"],
      ["ipsum", "argument"],
    ]);
  });
});

describe("literals and punctuation", () => {
  test("strings", () => {
    expect(tokenizeLine('Example "ATC-014"')).toStrictEqual([
      ["Example", "verbose"],
      ['"ATC-014"', "string"],
    ]);
  });

  test.each(["(", ")", "[", "]", "{", "}"])("%s is a bracket", (b) =>
    expect(kindOf(b)).toBe("bracket"),
  );

  test("line comment", () => {
    expect(tokenizeLine("-- a comment")).toStrictEqual([
      ["-- a comment", "comment"],
    ]);
  });

  test("block comment", () => {
    expect(tokenizeLine("/- block -/ Fix")).toStrictEqual([
      ["/- block -/", "comment"],
      ["Fix", "tactic"],
    ]);
  });

  test("nested block comment", () => {
    expect(tokenizeLine("/- a /- b -/ c -/ Fix")).toStrictEqual([
      ["/- a /- b -/ c -/", "comment"],
      ["Fix", "tactic"],
    ]);
  });
});

describe("language support", () => {
  test("verbose() returns a LanguageSupport for leanVerbose", () => {
    expect(verbose().language.name).toBe("leanVerbose");
  });
});
