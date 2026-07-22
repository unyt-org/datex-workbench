<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import IconLogo from '@/components/icons/IconLogo.vue';
import { Network, SendToBack, Terminal, Box, GitGraph, Cpu, Info, Settings } from 'lucide-vue-next';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const sidebarItems = ref([
    { icon: Terminal, key: 'nav.repl', path: '/repl' },
    { icon: Cpu, key: 'nav.comhub', path: '/comhub' },
    { icon: SendToBack, key: 'nav.networkVisualizer', path: '/network-visualizer' },
    { icon: Box, key: 'nav.block', path: '/block' },
    { icon: Network, key: 'nav.network', path: '/network' },
    { icon: GitGraph, key: 'nav.nodeView', path: '/node-view' },
    { icon: Info, key: 'nav.about', path: '/about' },
    // { icon: AppWindow, name: 'Windows', path: '/windows' },
    // { icon: MousePointer2, name: 'Pointers', path: '/pointers' },
]);

const activePath = computed(() => route.path);

const navigate = (path: string) => {
    router.push(path);
};
</script>

<template>
    <!-- For Collapse -->
    <!-- :class="[isCollapsed ? 'w-0' : 'w-16']" -->
    <aside
        class="bg-transparent relative z-30 flex h-full w-16 flex-col border-r transition-all duration-300 ease-in-out select-none"
    >
        <!-- Button for Collapsing SideBar -->
        <!-- <button
            @click="isCollapsed = !isCollapsed"
            class="border-sidebar-border bg-sidebar absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 active:scale-95"
            title="Toggle Sidebar"
        >
            <ChevronLeft v-if="!isCollapsed" :size="14" class="text-sidebar-foreground" />
            <ChevronRight v-else :size="14" class="text-sidebar-foreground translate-x-1.5" />
        </button> -->

        <!-- For Collapse -->
        <!-- :class="[isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100']" -->
        <div
            class="flex h-full min-h-0 flex-col items-center overflow-visible transition-opacity duration-200 wco-container"
        >
            <div
                class="group relative flex w-full cursor-pointer items-center justify-center py-2"
                @click="navigate('/')"
            >
                <div
                    class="absolute left-0 h-10 w-0.5 rounded-full bg-sidebar-border transition-all"
                    :class="activePath === '/' ? 'opacity-100' : 'opacity-0'"
                ></div>

                <div
                    class="rounded-md p-2 transition-colors"
                    :class="
                        activePath === '/'
                            ? 'text-sidebar-foreground'
                            : 'text-dim hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    "
                >
                    <IconLogo :size="28" :stroke-width="1.5" />
                </div>

                <div
                    class="card invisible absolute left-14 z-999 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                >
                    {{ t('nav.welcome') }}
                    <div
                        class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                    ></div>
                </div>
            </div>

            <draggable
                v-model="sidebarItems"
                item-key="key"
                class="flex w-full flex-col items-center gap-4"
                ghost-class="opacity-20"
                animation="250"
            >
                <template #item="{ element }">
                    <div
                        class="group relative flex w-full cursor-pointer items-center justify-center py-2"
                        @click="navigate(element.path)"
                    >
                        <div
                            class="absolute left-0 h-10 w-0.5 rounded-full bg-sidebar-border transition-all"
                            :class="activePath === element.path ? 'opacity-100' : 'opacity-0'"
                        ></div>

                        <div
                            class="rounded-md p-2 transition-colors"
                            :class="
                                activePath === element.path
                                    ? 'text-sidebar-foreground'
                                    : 'text-dim hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            "
                        >
                            <component :is="element.icon" :size="28" :stroke-width="1.5" />
                        </div>

                        <div
                            class="card invisible absolute left-14 z-999 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                        >
                            {{ t(element.key) }}

                            <div
                                class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                            ></div>
                        </div>
                    </div>
                </template>
            </draggable>

            <div class="mt-auto pb-4 w-full">
                <div
                    class="group relative flex w-full cursor-pointer items-center justify-center py-2"
                    @click="navigate('/preferences')"
                >
                    <div
                        class="absolute left-0 h-10 w-0.5 rounded-full bg-sidebar-border transition-all"
                        :class="activePath === '/preferences' ? 'opacity-100' : 'opacity-0'"
                    ></div>

                    <div
                        class="rounded-md p-2 transition-colors"
                        :class="
                            activePath === '/preferences'
                                ? 'text-sidebar-foreground'
                                : 'text-dim hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        "
                    >
                        <Settings :size="28" :stroke-width="1.5" />
                    </div>

                    <div
                        class="card invisible absolute left-14 z-999 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                    >
                        {{ t('nav.preferences') }}

                        <div
                            class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
aside > div {
    min-width: 64px;
}

aside {
    overflow: visible;
}

.sortable-ghost {
    background: var(--sidebar-accent);
    border-radius: var(--radius-md);
}

@media (display-mode: window-controls-overlay) {
    .wco-container {
        padding-top: env(titlebar-area-height, 0);
        -webkit-app-region: drag;
    }

    .wco-container > * {
        -webkit-app-region: no-drag;
    }
}
</style>
