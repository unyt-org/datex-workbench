<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import {
    Network,
    Terminal,
    ChevronLeft,
    ChevronRight,
    Box,
    GitGraph,
    Code2,
    Cpu,
    MousePointer2,
    AppWindow,
} from 'lucide-vue-next';
import draggable from 'vuedraggable';

export default defineComponent({
    components: {
        draggable,
        ChevronLeft,
        ChevronRight,
        ThemeSwitch,
    },
    setup() {
        const router = useRouter();
        const route = useRoute();
        // const isCollapsed = ref(false);

        const sidebarItems = ref([
            { icon: IconLogo, name: 'Welcome', path: '/' },
            { icon: Terminal, name: 'REPL', path: '/repl' },
            { icon: Box, name: 'Blocks', path: '/blocks' },
            { icon: Network, name: 'Network', path: '/network' },
            { icon: GitGraph, name: 'Node View', path: '/node-view' },
            { icon: Code2, name: 'Editor', path: '/editor' },
            { icon: AppWindow, name: 'Windows', path: '/windows' },
            { icon: Cpu, name: 'ComHub', path: '/comhub' },
            { icon: MousePointer2, name: 'Pointers', path: '/pointers' },
        ]);

        const activePath = computed(() => route.path);

        const navigate = (path: string) => {
            router.push(path);
        };

        return {
            // isCollapsed,
            activePath,
            sidebarItems,
            navigate,
        };
    },
});
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
        <div class="flex flex-col items-center py-4 transition-opacity duration-200 h-full">
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
            <div class="mt-auto">
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
</style>
