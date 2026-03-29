import { ref } from 'vue';
import { Datex } from '@/lib/runtime';

export interface ReplEntry {
    type: 'input' | 'output' | 'error';
    content: string;
}

const entries = ref<ReplEntry[]>([]);
const history = ref<string[]>([]);
const suggestions = ref<string[]>([]);

// unused template for future LSP
// function startLspTemplate() {
//     Datex.startLSP({
//         onHover(payload) {
//             console.log('hover', payload);
//         },
//         onCompletion(payload) {
//             console.log('completion', payload);
//         },
//         onDiagnostics(payload) {
//             console.log('diagnostics', payload);
//         },
//     });
// }

export function useDatexRepl() {
    function updateSuggestions(input: string) {
        const trimmed = input.trim();

        if (!trimmed) {
            suggestions.value = [];
            return;
        }

        const lastTokenMatch = input.match(/(\w+)$/);
        if (!lastTokenMatch) {
            suggestions.value = [];
            return;
        }

        const lastToken = lastTokenMatch[0];

        const keywords = ['var', 'true', 'false', 'null', 'clear', 'reset', 'help', 'test'];

        suggestions.value = keywords.filter((k) => k.startsWith(lastToken)).slice(0, 8);
    }

    async function executeCommand(code: string) {
        if (!code.trim()) return;

        entries.value.push({ type: 'input', content: code });

        if (history.value[0] !== code) {
            history.value.unshift(code);
        }

        const cmd = code.trim().toLowerCase();

        if (cmd === 'clear') {
            entries.value = [];
            return;
        }

        if (cmd === 'reset') {
            reset();
            return;
        }

        if (cmd === 'help') {
            entries.value.push({
                type: 'output',
                content:
                    '<span class="text-cyan-400 font-semibold">DATEΧ REPL Help</span>\n\n' +
                    '<span class="text-cyan-400">Commands:</span>\n' +
                    '<span class="text-emerald-400">help</span>  ─ Show all available commands\n' +
                    '<span class="text-emerald-400">clear</span> ─ Clear console output\n' +
                    '<span class="text-emerald-400">reset</span> ─ Reset REPL state and history\n' +
                    '<span class="text-emerald-400">test</span>  ─ Run test command (if available)\n\n' +
                    '<span class="text-cyan-400">Autocomplete:</span>\n' +
                    'Tab ─ Cycle suggestions\n' +
                    'Right Arrow ─ Accept suggestion\n\n' +
                    '<span class="text-cyan-400">Examples:</span>\n' +
                    '<span class="text-yellow-400">var a = 10</span>\n' +
                    '<span class="text-yellow-400">a + 5</span>\n' +
                    '<span class="text-yellow-400">true</span>\n',
            });
            return;
        }

        try {
            const result = await Datex.execute(code);

            entries.value.push({
                type: 'output',
                content: formatOutput(Datex.valueToString(result)),
            });
        } catch (err: any) {
            entries.value.push({
                type: 'error',
                content: err?.message || String(err),
            });
        }
    }

    function reset() {
        entries.value = [];
        history.value = [];
        suggestions.value = [];
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
        suggestions,
        executeCommand,
        updateSuggestions,
        clear: () => (entries.value = []),
        reset,
    };
}
