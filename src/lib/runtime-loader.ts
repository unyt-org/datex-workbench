const localModuleUrl = localStorage.getItem('localDatexModuleUrl');

let mod: typeof import('@unyt/datex');

if (localModuleUrl) {
    try {
        mod = (await import(localModuleUrl)) as typeof import('@unyt/datex');
        localStorage.removeItem('localDatexModuleUrlFailed');
    } catch (error) {
        console.error(`Failed to load local module from ${localModuleUrl}:`, error);
        localStorage.setItem('localDatexModuleUrlFailed', 'true');
        mod = await import('@unyt/datex');
    }
} else {
    mod = await import('@unyt/datex');
}

// re-export everything from the module
export const DIF = mod.DIF;
export const Runtime = mod.Runtime;
export const Network = mod.Network;
export const Builtins = mod.Builtins;
export const Repl = mod.Repl;
export const Shared = mod.Shared;
