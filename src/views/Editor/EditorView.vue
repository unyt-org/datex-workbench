<script setup lang="ts">
import { lazy, Workspace } from 'modern-monaco';

// Create a workspace with an initial demo file
const workspace = new Workspace({
  initialFiles: {
    "index.html": `<html><body>...</body></html>`,
    "main.js": `console.log("Hello, world!")`,
  },
  entryFile: "main.js",
});

// initialize the editor lazily
lazy({ workspace });

await workspace.fs.writeFile("util.js", "export function add(a, b) { return a + b; }");
workspace.openTextDocument("util.js");
</script>

<template>
  <div class="editor-container">
    <monaco-editor></monaco-editor>
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
}
</style>
