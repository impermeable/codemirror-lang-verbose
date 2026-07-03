import { StringStream } from "@codemirror/language";
export type Token = "verbose" | "param" | "tactic" | "argument" | "string" | "comment" | "bracket";
export interface VerboseState {
    blockCommentDepth: number;
}
export declare function token(stream: StringStream, state: VerboseState): Token | null;
