import type { Reactive } from "vue";
import { reactive } from "vue";
import { Datex } from "./runtime";
import type { Shared } from '@unyt/datex';

type PointerData = {
  value: WeakRef<Shared.BaseSharedContainer<unknown, Shared.SharedContainerMutability>>;
};

export function getAllPointers(): Reactive<Map<string, PointerData>> {
  const cachedPointers = reactive(new Map<string, PointerData>());

  Datex.dif.registerCacheObserver(() => {
    const currentPointers = Datex.dif._cache;
    // add new pointers to the reactive map if they don't exist yet
    for (const [key, value] of currentPointers.entries()) {
      if (!cachedPointers.has(key)) {
        cachedPointers.set(key, value);
      }
    }
    // remove pointers from the reactive map if they no longer exist in the cache
    for (const key of cachedPointers.keys()) {
      if (!currentPointers.has(key)) {
        cachedPointers.delete(key);
      }
    }
  })

  return cachedPointers;
}
