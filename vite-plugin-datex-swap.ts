import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const PKG = '@unyt/datex';

const VIRTUAL_BASE = 'https://datex.unyt/';
const STORAGE_KEY = 'localDatexModuleUrl';
const VENDOR_DIR = 'vendor/datex';

const MIME_MAPPING = {
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.wasm': 'application/wasm',
};

export function datexSwap(): Plugin {
    // Resolve the package like Node does, then walk up to its root folder
    const entry = createRequire(import.meta.url).resolve(PKG); // …/@unyt/datex/esm/mod.js
    let pkgDir = path.dirname(fs.realpathSync(entry));
    while (
        !fs.existsSync(path.join(pkgDir, 'package.json')) ||
        JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')).name !== PKG
    ) {
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
    let outDir = 'dist';

    return {
        name: 'datex-swap',
        enforce: 'pre',

        config: () => ({ optimizeDeps: { exclude: [PKG] } }),

        configResolved(config) {
            base = config.base;
            outDir = path.resolve(config.root, config.build.outDir);
        },

        // Every import of the package (and its subpaths) becomes an external URL import
        resolveId(id) {
            const file = entries.get(id);
            if (file) return { id: VIRTUAL_BASE + file, external: true };
        },

        // Dev: serve the installed package
        configureServer(server) {
            const prefix = `${base}${VENDOR_DIR}/`;
            server.middlewares.use((req, res, next) => {
                const url = req.url?.split('?')[0];
                if (!url?.startsWith(prefix)) return next();

                const filePath = path.join(pkgDir, decodeURIComponent(url.slice(prefix.length)));
                const inside = !path.relative(pkgDir, filePath).startsWith('..');
                if (!inside || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                    res.statusCode = 404;
                    return res.end(`Not found in ${PKG}: ${url.slice(prefix.length)}`);
                }
                res.setHeader('Content-Type', MIME_MAPPING[path.extname(filePath)] ?? 'application/octet-stream');
                fs.createReadStream(filePath).pipe(res);
            });
        },

        // Build: copy esm/ to dist/vendor/datex/esm/
        closeBundle() {
            fs.cpSync(path.join(pkgDir, 'esm'), path.join(outDir, VENDOR_DIR, 'esm'), {
                recursive: true,
                dereference: true,
            });
        },

        // Importmap created dynamically at page load
        transformIndexHtml: {
            order: 'post',
            handler: () => [
                {
                    tag: 'script',
                    injectTo: 'head-prepend',
                    children: `(() => {
    let target = '${base}${VENDOR_DIR}/';
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
    };
}
