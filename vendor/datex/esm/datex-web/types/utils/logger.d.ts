import type { Tagged } from "../../../lib/mod.js";
export type LogLevel = Tagged<"Trace"> | Tagged<"Debug"> | Tagged<"Info"> | Tagged<"Warn"> | Tagged<"Error">;
export type LogMessage = {
    level: LogLevel;
    module: string;
    tag: string | null;
    message: string;
};
