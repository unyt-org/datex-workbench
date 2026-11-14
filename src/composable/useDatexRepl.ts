import { ref, shallowRef, watch, toValue, type MaybeRefOrGetter } from 'vue';
import { Datex } from '@/lib/runtime';
import type { Endpoint } from '@/lib/runtime-loader';

export interface ReplEntry {
    type: 'input' | 'output' | 'error';
    content: string | null;
}

type ReplState = {
  repl: InstanceType<typeof Repl>,
  entries: ReplEntry[];
  history: string[];
  suggestions: string[];
}

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

declare const Repl: {
    new (...args: any[]): any;
}; // FIXME

const cachedReplStates = new Map<Endpoint, ReplState>();

const DEFAULT_SUGGESTIONS: string[] = [
  'var',
  'true',
  'false',
  'null',
  'clear',
  'reset',
  'help',
  'test',
  'name',
  'endpoint'
];

export function useDatexRepl(endpoint: MaybeRefOrGetter<Endpoint | null>) {
    const repl = shallowRef<InstanceType<typeof Repl> | null>(null);
    const entries = ref<ReplEntry[]>([]);
    const history = ref<string[]>([]);
    const suggestions = ref<string[]>([]);

    const currentEndpoint = ref<Endpoint | null>(null);
    watch(
        () => toValue(endpoint),
        (ep) => {
            if (ep === currentEndpoint.value) return;
            // update cached state for the previous endpoint
            if (currentEndpoint.value && cachedReplStates.has(currentEndpoint.value)) {
                cachedReplStates.set(currentEndpoint.value, {
                    repl: repl.value!,
                    entries: entries.value,
                    history: history.value,
                    suggestions: suggestions.value,
                });
            }
            if (ep) {
                if (!cachedReplStates.has(ep)) {
                    cachedReplStates.set(ep, {
                        repl: new Repl(Datex, ep),
                        entries: [],
                        history: [],
                        suggestions: [],
                    });
                }
                const state = cachedReplStates.get(ep);
                repl.value = state?.repl ?? null;
                entries.value = state?.entries ?? [];
                history.value = state?.history ?? [];
                suggestions.value = state?.suggestions ?? [];
            } else {
                repl.value = null;
            }
            currentEndpoint.value = ep;
            console.log('using repl for ' + ep, repl.value);
        },
        { immediate: true },
    );

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

        const keywords = DEFAULT_SUGGESTIONS;

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

        // capture before await so a running command stays on its original endpoint
        const current = repl.value;
        if (!current) {
            entries.value.push({ type: 'error', content: 'No endpoint available' });
            return;
        }

        try {
            const result = await current.execute(code);

            entries.value.push({
                type: 'output',
                content: result,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);

            entries.value.push({
                type: 'error',
                content: message,
            });
        }
    }

    function reset() {
        entries.value = [];
        history.value = [];
        suggestions.value = [];
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
