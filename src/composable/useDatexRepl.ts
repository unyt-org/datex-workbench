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

/**
 * Stores entries and history in local storage for the given endpoint
 * @param endpoint
 * @param state
 */
function persistReplState(endpoint: Endpoint, state: ReplState) {
  const key = `replState:${endpoint}`;
  localStorage.setItem(key, JSON.stringify({
    entries: state.entries,
    history: state.history,
  }));
}

function tryLoadPersistedReplState(endpoint: Endpoint): ReplState | null {
  const key = `replState:${endpoint}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      repl: new Repl(Datex, endpoint),
      entries: parsed.entries ?? [],
      history: parsed.history ?? [],
      suggestions: [],
    };
  } catch {
    return null;
  }
}

export function useDatexRepl(endpoint: MaybeRefOrGetter<Endpoint | null>) {
    const repl = shallowRef<InstanceType<typeof Repl> | null>(null);
    const entries = ref<ReplEntry[]>([]);
    const history = ref<string[]>([]);
    const suggestions = ref<string[]>([]);

    watch(
        [entries, history],
        ([newEntries, newHistory]) => {
          if (toValue(endpoint)) {
            const state = cachedReplStates.get(toValue(endpoint)) ?? {
                repl: repl.value,
                entries: [],
                history: [],
                suggestions: suggestions.value,
            };

            state.entries = newEntries;
            state.history = newHistory;

            cachedReplStates.set(toValue(endpoint), state);
            persistReplState(toValue(endpoint), state);
          }
        },
        { deep: true },
    );

    watch(() => toValue(endpoint), (ep) => {
        if (ep) {
          if (!cachedReplStates.has(ep)) {
            const persistedState = tryLoadPersistedReplState(ep);
            cachedReplStates.set(ep, persistedState ?? {
                repl: new Repl(Datex, ep),
                entries: [],
                history: [],
                suggestions: [],
            });
          }

          const state = cachedReplStates.get(ep)!;
          repl.value = state.repl ?? null;
          entries.value = state.entries ?? [];
          history.value = state.history ?? [];
          suggestions.value = state.suggestions ?? [];
        }
    }, { immediate: true });

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
