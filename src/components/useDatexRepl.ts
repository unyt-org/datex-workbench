import { ref } from 'vue';
import { Datex } from '@/lib/runtime';

export interface ReplEntry {
    type: 'input' | 'output' | 'error';
    content: string;
}

const entries = ref<ReplEntry[]>([]);
const history = ref<string[]>([]);
const context = ref<Record<string, any>>({});
const suggestions = ref<string[]>([]);

function getSuggestions(input: string): string[] {
    const trimmed = input.trim();

    return [
        ...getNestedSuggestions(trimmed),
        ...getObjectSuggestions(trimmed),
        ...getRuntimeSuggestions(trimmed),
        ...getKeywordSuggestions(trimmed),
    ]
        .filter(Boolean)
        .slice(0, 8);
}

const KEYWORDS = ['var', 'true', 'false', 'null'];

function getKeywordSuggestions(input: string) {
    return KEYWORDS.filter((k) => k.startsWith(input));
}

function extractVariables(code: string, result: any) {
    const matches = code.match(/var\s+(\w+)/g);
    if (!matches) return;

    matches.forEach((m) => {
        const name = m.replace(/var\s+/, '').trim();
        context.value[name] = result;
    });
}

function getRuntimeSuggestions(input: string) {
    return Object.keys(context.value).filter((k) => k.startsWith(input));
}

function getObjectSuggestions(input: string) {
    const match = input.match(/(\w+)\.$/);
    if (!match || !match[1]) return [];

    const objName = match[1];
    const obj = context.value[objName];

    if (!obj || typeof obj !== 'object') return [];

    return Object.keys(obj).map((k) => `${objName}.${k}`);
}

function resolvePath(path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], context.value);
}

function getNestedSuggestions(input: string) {
    const match = input.match(/([\w\.]+)$/);
    if (!match || !match[1]) return [];

    const path = match[1];

    const parts = path.split('.');
    const last = parts.pop() || '';
    const parentPath = parts.join('.');

    const parent = parentPath ? resolvePath(parentPath) : context.value;

    if (!parent || typeof parent !== 'object') return [];

    return Object.keys(parent)
        .filter((k) => k.startsWith(last))
        .map((k) => (parentPath ? `${parentPath}.${k}` : k));
}

function updateSuggestions(input: string) {
    suggestions.value = getSuggestions(input);
}

export function useDatexRepl() {
    async function executeCommand(code: string) {
        entries.value.push({ type: 'input', content: code });

        // Manage History  (Requirement #81)
        if (history.value[0] !== code) {
            history.value.unshift(code);
        }
        if (code.includes('*')) {
            entries.value.push({
                type: 'error',
                content:
                    'REPL Warning: Multiplication is currently not implemented in the core engine.',
            });
            return;
        }
        try {
            // DATEX Execute (Requirement #82)
            const result = await Datex.execute(code);
            console.log(result);
            extractVariables(code, result);

            const formattedResult = Datex.valueToString(result);

            entries.value.push({
                type: 'output',
                content: formatOutput(formattedResult),
            });
        } catch (err: any) {
            // Custom Error Highlight (Requirement #83)
            entries.value.push({
                type: 'error',
                content: `Runtime Error: ${err?.message || String(err)}`,
            });
        }
    }

    function formatOutput(val: any): string {
        // process null, undefined, or empty results explicitly (Requirement #84/82)
        if (val === 'null' || val === null || val === undefined) {
            return '<span class="opacity-40 italic">void (no return value)</span>';
        }

        // Basic color support (Requirement #82)
        if (typeof val === 'string') {
            return val
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\x1b\[32m/g, '<span class="text-emerald-400">')
                .replace(/\x1b\[31m/g, '<span class="text-red-400">')
                .replace(/\x1b\[0m/g, '</span>');
        }
        return JSON.stringify(val, null, 2);
    }

    function clear() {
        entries.value = [];
    }

    return { entries, history, executeCommand, clear, suggestions, updateSuggestions };
}
