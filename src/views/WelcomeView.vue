<script setup lang="ts">
import { useRouter } from 'vue-router';
import IconLogo from '@/components/icons/IconLogo.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();

const quickActions = computed(() => [
    {
        label: t('nav.network'),
        description: t('welcome.networkDesc'),
        icon: 'network',
        route: '/network',
        available: true,
    },
    {
        label: t('nav.nodeView'),
        description: t('welcome.nodeDesc'),
        icon: 'node',
        route: '/node-view',
        available: true,
    },
    {
        label: t('welcome.fileEditor'),
        description: t('welcome.editorDesc'),
        icon: 'editor',
        route: '/editor',
        available: true,
    },
    {
        label: t('welcome.repl'),
        description: t('welcome.replDesc'),
        icon: 'repl',
        route: '/repl',
        available: true,
    },
]);

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
                    Quick Actions
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <button
                        v-for="action in quickActions"
                        :key="action.label"
                        class="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-all"
                        :class="
                            action.available
                                ? 'hover:border-primary/50 hover:bg-accent cursor-pointer'
                                : 'opacity-50 cursor-not-allowed'
                        "
                        @click="navigate(action.route)"
                    >
                        <!-- Icon -->
                        <div class="flex items-center justify-between">
                            <div
                                class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"
                            >
                                <!-- Network -->
                                <svg
                                    v-if="action.icon === 'network'"
                                    class="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <circle cx="12" cy="5" r="3" />
                                    <circle cx="19" cy="19" r="3" />
                                    <circle cx="5" cy="19" r="3" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="12" x2="19" y2="16" />
                                    <line x1="12" y1="12" x2="5" y2="16" />
                                </svg>
                                <!-- Node -->
                                <svg
                                    v-else-if="action.icon === 'node'"
                                    class="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                    <line x1="10" y1="6.5" x2="14" y2="6.5" />
                                    <line x1="6.5" y1="10" x2="6.5" y2="14" />
                                </svg>
                                <!-- Editor -->
                                <svg
                                    v-else-if="action.icon === 'editor'"
                                    class="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path
                                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                    />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                <!-- REPL -->
                                <svg
                                    v-else-if="action.icon === 'repl'"
                                    class="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <polyline points="4 17 10 11 4 5" />
                                    <line x1="12" y1="19" x2="20" y2="19" />
                                </svg>
                            </div>
                            <span
                                v-if="!action.available"
                                class="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5"
                            >
                                Soon
                            </span>
                            <svg
                                v-else
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
                            <p class="text-sm font-medium text-foreground">{{ action.label }}</p>
                            <p class="text-xs text-muted-foreground">{{ action.description }}</p>
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
