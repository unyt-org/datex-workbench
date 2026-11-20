/**
 * General static information about the runtime, e.g. version numbers.
 */
export type RuntimeInfo = {
    datex_version: string;
    other_versions: Map<string, string>;
    device_type: string | null;
    running_since: number;
};
export type HeapStats = {
    total: number;
    used: number;
    max_used: number;
};
export type RuntimeStats = {
    heap: HeapStats | null;
};
