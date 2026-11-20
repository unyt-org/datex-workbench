import type { Tagged } from "../../../lib/mod.js";
export type IndentType = Tagged<"Spaces"> | Tagged<"Tabs">;
export type FormattingMode = Tagged<"Compact"> | Tagged<"Pretty", {
    indent: number;
    indent_type: IndentType;
}>;
export type FormattingOptions = {
    mode: FormattingMode;
    json_compat: boolean;
    colorized: boolean;
};
export type DecompileOptions = {
    formatting_options: FormattingOptions;
    resolve_slots: boolean;
};
