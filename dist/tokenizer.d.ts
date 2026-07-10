import { StringStream } from "@codemirror/language";
export type Token = "verbose" | "param" | "tactic" | "argument" | "string" | "comment" | "code" | "bracket";
export interface VerboseState {
    blockCommentDepth: number;
    lineComment: boolean;
}
export declare function token(stream: StringStream, state: VerboseState): Token | null;
