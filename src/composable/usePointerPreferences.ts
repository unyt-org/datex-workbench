import { ref, watch } from 'vue'

export interface PointerPreferences {
  show_full_pointer_ids: boolean
  show_type_hints: boolean
  show_array_indicies: boolean
  hide_type_hints_for_primitives: boolean
  hide_map_key_type_hints_for_primitives: boolean
}

const STORAGE_KEY = 'pointer-view-preferences'

// Default preferences
const defaultPreferences: PointerPreferences = {
  show_full_pointer_ids: false,
  show_type_hints: false,
  show_array_indicies: true,
  hide_type_hints_for_primitives: true,
  hide_map_key_type_hints_for_primitives: true,
}

// Load preferences from localStorage
function loadPreferences(): PointerPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to handle new preference additions
      return { ...defaultPreferences, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load pointer preferences:', error)
  }
  return { ...defaultPreferences }
}

// Save preferences to localStorage
function savePreferences(preferences: PointerPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch (error) {
    console.warn('Failed to save pointer preferences:', error)
  }
}

// Shared reactive state (singleton pattern)
const preferences = ref<PointerPreferences>(loadPreferences())

// Watch for changes and persist automatically
watch(
  preferences,
  (newPreferences) => {
    savePreferences(newPreferences)
  },
  { deep: true }
)

/**
 * Composable for managing pointer view preferences
 * Provides reactive preferences with automatic localStorage persistence
 */
export function usePointerPreferences() {
  /**
   * Update a specific preference
   */
  function updatePreference<K extends keyof PointerPreferences>(
    key: K,
    value: PointerPreferences[K]
  ): void {
    preferences.value[key] = value
  }

  /**
   * Reset all preferences to defaults
   */
  function resetPreferences(): void {
    preferences.value = { ...defaultPreferences }
  }

  /**
   * Update multiple preferences at once
   */
  function updatePreferences(updates: Partial<PointerPreferences>): void {
    preferences.value = { ...preferences.value, ...updates }
  }

  return {
    preferences,
    updatePreference,
    resetPreferences,
    updatePreferences,
  }
}
