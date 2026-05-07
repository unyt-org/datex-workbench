<script setup lang="ts">
import { ref } from 'vue';
import { usePreferences } from '@/preferences';
import { RotateCcw, AlertTriangle } from 'lucide-vue-next';

const { preferences, resetSection, resetAll } = usePreferences();

const showResetAllConfirm = ref(false);

function confirmResetAll() {
    resetAll();
    showResetAllConfirm.value = false;
}
</script>

<template>
    <div class="flex h-full w-full justify-center overflow-y-auto p-6">
        <div class="w-full max-w-2xl space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-semibold text-foreground">Preferences</h1>
                <button
                    class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    @click="showResetAllConfirm = true"
                >
                    <RotateCcw class="size-3.5" />
                    Reset all
                </button>
            </div>

            <!-- Appearance -->
            <section class="rounded-xl border border-border bg-card p-6">
                <header class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-medium text-foreground">Appearance</h2>
                    <button
                        class="text-xs text-muted-foreground hover:text-foreground transition"
                        @click="resetSection('appearance')"
                    >
                        Reset
                    </button>
                </header>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-foreground">Theme</div>
                            <div class="text-xs text-muted-foreground">Choose the color theme</div>
                        </div>
                        <select
                            v-model="preferences.appearance.theme"
                            class="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
                        >
                            <option value="system">System</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-foreground">High contrast</div>
                            <div class="text-xs text-muted-foreground">
                                Increase contrast for better readability
                            </div>
                        </div>
                        <input
                            v-model="preferences.appearance.highContrast"
                            type="checkbox"
                            class="size-4 accent-primary cursor-pointer"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-foreground">Reduce motion</div>
                            <div class="text-xs text-muted-foreground">
                                Minimize animations and transitions
                            </div>
                        </div>
                        <input
                            v-model="preferences.appearance.reduceMotion"
                            type="checkbox"
                            class="size-4 accent-primary cursor-pointer"
                        />
                    </div>
                </div>
            </section>

            <!-- Language -->
            <section class="rounded-xl border border-border bg-card p-6">
                <header class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-medium text-foreground">Language</h2>
                    <button
                        class="text-xs text-muted-foreground hover:text-foreground transition"
                        @click="resetSection('language')"
                    >
                        Reset
                    </button>
                </header>

                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm text-foreground">Locale</div>
                        <div class="text-xs text-muted-foreground">Interface language</div>
                    </div>
                    <select
                        v-model="preferences.language.locale"
                        class="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
                    >
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="hi">हिन्दी</option>
                    </select>
                </div>
            </section>

            <!-- Editor -->
            <section class="rounded-xl border border-border bg-card p-6">
                <header class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-medium text-foreground">Editor</h2>
                    <button
                        class="text-xs text-muted-foreground hover:text-foreground transition"
                        @click="resetSection('editor')"
                    >
                        Reset
                    </button>
                </header>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-foreground">Font size</div>
                            <div class="text-xs text-muted-foreground">
                                Editor text size in pixels
                            </div>
                        </div>
                        <input
                            v-model.number="preferences.editor.fontSize"
                            type="number"
                            min="10"
                            max="24"
                            class="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground w-20"
                        />
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm text-foreground">Show line numbers</div>
                            <div class="text-xs text-muted-foreground">
                                Display line numbers in the editor
                            </div>
                        </div>
                        <input
                            v-model="preferences.editor.showLineNumbers"
                            type="checkbox"
                            class="size-4 accent-primary cursor-pointer"
                        />
                    </div>
                </div>
            </section>

            <!-- Reset all confirmation -->
            <div
                v-if="showResetAllConfirm"
                class="fixed inset-0 z-50 flex items-center justify-center bg-background/80"
                @click.self="showResetAllConfirm = false"
            >
                <div class="rounded-xl border border-border bg-card p-6 max-w-sm shadow-lg">
                    <div class="flex items-start gap-3">
                        <AlertTriangle class="size-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 class="text-sm font-medium text-foreground">
                                Reset all preferences?
                            </h3>
                            <p class="mt-1 text-xs text-muted-foreground">
                                This will restore all settings to their default values. This action
                                cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 flex justify-end gap-2">
                        <button
                            class="rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted transition"
                            @click="showResetAllConfirm = false"
                        >
                            Cancel
                        </button>
                        <button
                            class="rounded-md bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs text-white transition"
                            @click="confirmResetAll"
                        >
                            Reset all
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
