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

function getLiveBufferContext(input: string): Record<string, any> {
    const liveCtx: Record<string, any> = {};
    const varMatches = input.matchAll(/var\s+(\w+)\s*=\s*([^;]+)/g);

    for (const match of varMatches) {
        const varName = match[1];
        const valueSnippet = match[2].trim();
        try {
            liveCtx[varName] = new Function(`return ${valueSnippet}`)();
        } catch {}
    }
    return liveCtx;
}

export function useDatexRepl() {
    function updateSuggestions(input: string) {
        const trimmed = input.trim();
        if (!trimmed) {
            suggestions.value = [];
            return;
        }

        const combinedContext = { ...context.value, ...getLiveBufferContext(input) };

        const lastTokenMatch = input.match(/([\w.]+)$/);
        if (!lastTokenMatch) return;

        const fullPath = lastTokenMatch[0];
        const parts = fullPath.split('.');
        const lastPart = parts.pop() || '';
        const parentPath = parts.join('.');

        const parent = parentPath
            ? parts.reduce((acc, key) => acc?.[key], combinedContext)
            : combinedContext;

        if (parent && typeof parent === 'object') {
            const matches = Object.keys(parent)
                .filter((k) => k.startsWith(lastPart))
                .map((k) => (parentPath ? `${parentPath}.${k}` : k));

            if (!parentPath) {
                const keywords = ['var', 'true', 'false', 'null', 'clear', 'help', 'test'].filter(
                    (k) => k.startsWith(lastPart),
                );
                matches.push(...keywords);
            }

            suggestions.value = Array.from(new Set(matches)).slice(0, 8);
        }
    }
    // const testFn = () => {
    //     console.log('testLSP');
    // };
    async function executeCommand(code: string) {
        // console.log(Datex.startLSP(testFn));
        if (!code.trim()) return;
        entries.value.push({ type: 'input', content: code });

        if (history.value[0] !== code) history.value.unshift(code);

        const cmd = code.trim().toLowerCase();
        if (cmd === 'clear') {
            entries.value = [];
            return;
        }
        if (cmd === 'help') {
            entries.value.push({
                type: 'output',
                content:
                    '<span class="text-cyan-400">Commands:</span> clear, help, reset\n<span class="text-cyan-400">Keys:</span> Tab (Cycle), Right (Accept)',
            });
            return;
        }

        try {
            const result = await Datex.execute(code);
            // console.log(result);

            const varMatch = code.match(/var\s+(\w+)/);
            varMatch && (context.value[varMatch[1]] = result);

            entries.value.push({
                type: 'output',
                content: formatOutput(Datex.valueToString(result)),
            });
        } catch (err: any) {
            entries.value.push({ type: 'error', content: err?.message || String(err) });
        }
    }

    function formatOutput(val: any): string {
        if (val === 'null' || val === undefined) {
            return '<span class="opacity-40 italic">void</span>';
        }

        return String(val)
            .replace(/\x1b\[32m/g, '<span class="text-emerald-400">')
            .replace(/\x1b\[31m/g, '<span class="text-red-400">')
            .replace(/\x1b\[33m/g, '<span class="text-yellow-400">')
            .replace(/\x1b\[36m/g, '<span class="text-cyan-400">')
            .replace(/\x1b\[0m/g, '</span>');
    }
    return {
        entries,
        history,
        executeCommand,
        suggestions,
        updateSuggestions,
        clear: () => (entries.value = []),
    };
}
