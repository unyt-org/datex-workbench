<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import {
    Network,
    Terminal,
    Box,
    GitGraph,
    Cpu,
    Info,
} from 'lucide-vue-next';
import draggable from 'vuedraggable';

const router = useRouter();
const route = useRoute();

const sidebarItems = ref([
    { icon: Terminal, name: 'REPL', path: '/repl' },
    { icon: Cpu, name: 'ComHub', path: '/comhub' },
    { icon: Box, name: 'Blocks', path: '/blocks' },
    { icon: Network, name: 'Network', path: '/network' },
    { icon: GitGraph, name: 'Node View', path: '/node-view' },
    { icon: Info, name: 'About', path: '/about' },
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
        class="bg-transparent relative flex h-full flex-col border-r transition-all duration-300 ease-in-out select-none w-16"
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
        <div class="flex flex-col items-center wco-container transition-opacity duration-200 h-full">
            
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
                    class="card invisible absolute left-14 z-50 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                >
                    Welcome

                    <div
                        class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                    ></div>
                </div>
            </div>

            <draggable
                v-model="sidebarItems"
                item-key="name"
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
                            class="card invisible absolute left-14 z-50 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                        >
                            {{ element.name }}

                            <div
                                class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                            ></div>
                        </div>
                    </div>
                </template>
            </draggable>
            <div class="mt-auto pb-4">
                <ThemeSwitch />
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
