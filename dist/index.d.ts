import { HighlightStyle, LanguageSupport, StreamLanguage } from "@codemirror/language";
import { VerboseState } from "./tokenizer";
export declare const highlight_dark: HighlightStyle;
export declare const highlight_light: HighlightStyle;
export declare const leanVerboseLanguage: StreamLanguage<VerboseState>;
export declare function verbose(): LanguageSupport;
