import { ref, watch, type Ref } from "vue";

/**
 * Loads an existing JSON compatible value from localStorage or initializes it with the provided value.
 * Any changes to the returned ref will be automatically persisted to localStorage.
 * @param key The key under which the value is stored in localStorage.
 * @param initialValue The initial value to use if no value is found in localStorage.
 * @returns A ref containing the persisted value.
 */
export function usePersistentRef<T>(key: string, initialValue: T): Ref<T> {
    const storedValue = localStorage.getItem(key);
    const refValue = ref(storedValue ? JSON.parse(storedValue) : initialValue);

    watch(refValue, (newValue) => {
        localStorage.setItem(key, JSON.stringify(newValue));
    }, { deep: true });

    return refValue;
}
