<script setup lang="ts">
import { useRouter } from 'vue-router';
import IconLogo from '@/components/icons/IconLogo.vue';
import { useI18n } from 'vue-i18n';
import { sidebarItems } from '@/lib/sidebar-items';

const { t } = useI18n();
const router = useRouter();


const quickActionItems = ['repl', 'networkInspector', 'memory', 'about'];

const quickActions = sidebarItems
    .filter((item) => quickActionItems.includes(item.key))
    .sort((a, b) => quickActionItems.indexOf(a.key) - quickActionItems.indexOf(b.key));

function navigate(route: string | null) {
    if (route) router.push(route);
}
</script>

<template>
    <main class="flex h-full w-full items-center justify-center bg-background p-8">
        <div class="no-drag flex flex-col items-center justify-center gap-12">
            <!-- Header -->
            <div class="flex flex-col items-center gap-2 text-center">
                <div class="flex items-center gap-3">
                    <IconLogo class="h-12 w-12" />
                    <h1 class="text-3xl font-semibold tracking-tight text-foreground">
                        DATEX Workbench
                    </h1>
                </div>
                <p class="text-sm text-muted-foreground">
                    {{ t('welcome.subtitle') }}
                </p>
            </div>

            <!-- Quick actions -->
            <div class="w-full max-w-2xl">
                <p class="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {{ t('welcome.quickActions') }}
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <button
                        v-for="action in quickActions"
                        :key="action.label"
                        class="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:bg-accent cursor-pointer"
                        @click="navigate(action.path)"
                    >
                        <!-- Icon -->
                        <div class="flex items-center justify-between">
                            <div
                                class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"
                            >
                                <component :is="action.icon" :size="28" class="h-4 w-4" />
                            </div>
                            <svg
                                class="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </div>

                        <!-- Text -->
                        <div>
                            <p class="text-sm font-medium text-foreground">{{ t(action.label) }}</p>
                            <p class="text-xs text-muted-foreground">{{ t(action.description) }}</p>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Footer links -->
            <div class="flex gap-6 text-xs text-muted-foreground">
                <a
                    href="https://unyt.org"
                    target="_blank"
                    class="hover:text-foreground transition-colors"
                    >unyt.org</a
                >
                <a
                    href="https://github.com/unyt-org/datex-workbench"
                    target="_blank"
                    class="hover:text-foreground transition-colors"
                    >GitHub</a
                >
                <a
                    href="https://docs.unyt.org"
                    target="_blank"
                    class="hover:text-foreground transition-colors"
                    >Docs</a
                >
            </div>
        </div>
    </main>
</template>
