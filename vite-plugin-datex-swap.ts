import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createRequire } from 'node:module';

const PKG = '@unyt/datex';

const VIRTUAL_BASE = 'https://datex.unyt/';
const STORAGE_KEY = 'localDatexModuleUrl';

export function datexSwap(): Plugin[] {
    // Resolve the package like Node does, then walk up to its root folder
    const entry = createRequire(import.meta.url).resolve(PKG); // …/@unyt/datex/esm/mod.js
    let pkgDir = path.dirname(fs.realpathSync(entry));
    while (!fs.existsSync(path.join(pkgDir, 'package.json'))
        || JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')).name !== PKG) {
        pkgDir = path.dirname(pkgDir);
    }
    console.log(`[datex-swap] using ${PKG} from ${pkgDir}`);

    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

    // Build a lookup from the package exports:
    // '@unyt/datex' -> 'esm/mod.js', '@unyt/datex/lib' -> 'esm/lib/mod.js', ...
    const entries = new Map<string, string>(
        Object.entries(pkgJson.exports as Record<string, { import?: string; default?: string }>).map(
            ([key, value]) => [
                PKG + key.slice(1),
                (value.import ?? value.default ?? '').replace(/^\.\//, ''),
            ],
        ),
    );

    let base = '/';

    return [
        {
            name: 'datex-swap',
            enforce: 'pre',

            config: () => ({ optimizeDeps: { exclude: [PKG] } }),

            configResolved(config) {
                base = config.base;
            },

            // Every import of the package (and its subpaths) becomes an external URL import
            resolveId(id) {
                const file = entries.get(id);
                if (file) return { id: VIRTUAL_BASE + file, external: true };
            },

            // Importmap created dynamically at page load
            transformIndexHtml: {
                order: 'post',
                handler: () => [
                    {
                        tag: 'script',
                        injectTo: 'head-prepend',
                        children: `(() => {
    let target = '${base}vendor/datex/';
    try {
        const override = localStorage.getItem('${STORAGE_KEY}');
        if (override) target = override.endsWith('/') ? override : override + '/';
    } catch {}
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({ imports: { '${VIRTUAL_BASE}': target } });
    document.currentScript.after(map);
})();`,
                    },
                ],
            },
        },

        // Default library served in dev, copied into dist/ on build
        ...viteStaticCopy({
            targets: [{ src: `node_modules/${PKG}/esm`, dest: 'vendor/datex' }],
        }),
    ];
}
