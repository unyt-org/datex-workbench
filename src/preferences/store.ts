import { reactive, watch } from 'vue';
import { useColorMode } from '@vueuse/core';
import { setLocale } from '@/i18n';
import { DEFAULT_PREFERENCES, STORAGE_KEY, type Preferences } from './schema';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges `source` into `target`. Used so that when we add new preferences
 * later, existing users with stored partial preferences get the new defaults
 * filled in automatically.
 */
function mergeDeep<T extends object>(target: T, source: Partial<T>): T {
    for (const key in source) {
        const sourceVal = source[key];
        const targetVal = target[key];
        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
            target[key] = mergeDeep(targetVal as object, sourceVal as object) as T[Extract<
                keyof T,
                string
            >];
        } else if (sourceVal !== undefined) {
            target[key] = sourceVal as T[Extract<keyof T, string>];
        }
    }
    return target;
}

function loadPreferences(): Preferences {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_PREFERENCES);
        const parsed = JSON.parse(raw) as Partial<Preferences>;
        return mergeDeep(structuredClone(DEFAULT_PREFERENCES), parsed);
    } catch {
        return structuredClone(DEFAULT_PREFERENCES);
    }
}

const preferences = reactive<Preferences>(loadPreferences());

// Auto-persist on any change
watch(
    preferences,
    (val) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
        } catch (err) {
            console.error('[Preferences] Failed to save:', err);
        }
    },
    { deep: true },
);

// --- Sync watchers ---

// Theme: preferences.appearance.theme → vueuse useColorMode
const mode = useColorMode();
function applyTheme(theme: Preferences['appearance']['theme']) {
    mode.value = theme === 'system' ? 'auto' : theme;
}
applyTheme(preferences.appearance.theme); // initial
watch(
    () => preferences.appearance.theme,
    (next) => applyTheme(next),
);

watch(
    () => mode.value,
    (next) => {
        const mapped = next === 'auto' ? 'system' : next;
        if (preferences.appearance.theme !== mapped) {
            preferences.appearance.theme = mapped;
        }
    },
);

// Locale: preferences.language.locale → i18n + document.documentElement.lang
function applyLocale(locale: Preferences['language']['locale']) {
    setLocale(locale); // already updates i18n + localStorage + html lang
}
applyLocale(preferences.language.locale); // initial
watch(
    () => preferences.language.locale,
    (next) => applyLocale(next),
);

function resetSection<K extends keyof Preferences>(section: K) {
    preferences[section] = structuredClone(DEFAULT_PREFERENCES[section]);
}

function resetAll() {
    Object.assign(preferences, structuredClone(DEFAULT_PREFERENCES));
}

export function usePreferences() {
    return {
        preferences,
        resetSection,
        resetAll,
    };
}
