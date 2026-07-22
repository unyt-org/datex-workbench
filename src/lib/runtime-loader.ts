const localModuleUrl = localStorage.getItem("localDatexModuleUrl");

const mod = localModuleUrl
  ? await import(localModuleUrl) as typeof import("@unyt/datex")
  : await import("@unyt/datex");

// re-export everything from the module
export const DIF = mod.DIF;
export const Runtime = mod.Runtime;
export const Network = mod.Network;
export const Builtins = mod.Builtins;
export const Repl = mod.Repl;
export const Shared = mod.Shared;
