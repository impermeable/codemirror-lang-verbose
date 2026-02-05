
import { expect } from "@jest/globals";

import { parser } from "../src/syntax";
import { Tree } from "@lezer/common";
import tactics from "./tacticsLean.json";

const Program = "Program",
    Sentence = "Sentence",
    EOS = "EndOfSentence",
    Atom = "Atom";

function treeToTrace(input: Tree) {
    const trace: string[] = [];
    input.iterate({
        enter(node) {
            trace.push(node.type.name);
        },
        leave(node) {
            // Skip adding leaf nodes twice
            if (trace.at(-1) !== node.type.name)
                trace.push(node.type.name);
        }
    });
    return trace;
}

test("End of sentence", () => {
    const source = "placeholder";
    const tree = parser.parse(source);
    const trace = treeToTrace(tree);
    expect(trace).toStrictEqual([
        Program,
        Sentence,
        Atom,
        "Chunk",
        Atom,
        EOS, Sentence,
        Program
    ]);

});

test("Unrecognised sequence", () => {
    const source = "Lorem ipsum";
    const tree = parser.parse(source);
    const trace = treeToTrace(tree);
    expect(trace).toStrictEqual([
        Program,
        Sentence,
        Atom,
        "Chunk",
        Atom,
        Atom,
        "Chunk",
        Atom,
        EOS, Sentence,
        Program
    ]);
});

test("We compute", () => {
    const source = "We compute";
    const tree = parser.parse(source);
    const trace = treeToTrace(tree);
    expect(trace).toStrictEqual([
        Program,
        Sentence,
        Atom,
        "We",
        Atom,
        Atom,
        "Compute",
        Atom,
        EOS, Sentence,
        Program
    ]);
});

test("Parse example's keywords", () => {
    const source = `Example "Hello"
    Given:
    Assume:
    Conclusion:
    Proof:
    QED`;
    const tree = parser.parse(source);
    const trace = treeToTrace(tree);
    expect(trace).toStrictEqual([
        Program,
        Sentence,
        Atom,
        "Example",
        Atom,
        Atom,
        "String",
        Atom,
        EOS, Sentence,

        Sentence,
        Atom,
        "Given",
        Atom,
        EOS, Sentence,

        Sentence,
        Atom,
        "Assume",
        Atom,
        EOS, Sentence,

        Sentence,
        Atom,
        "Conclusion",
        Atom,
        EOS, Sentence,

        Sentence,
        Atom,
        "Proof",
        Atom,
        EOS, Sentence,

        Sentence,
        Atom,
        "QED",
        Atom,
        EOS, Sentence,
        Program
    ]);
});

