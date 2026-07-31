import { Datex } from "./runtime";

export function getAllPointers(): Map<string, any> {
  const cachedPointers = Datex.dif._cache;
  return cachedPointers;
}
