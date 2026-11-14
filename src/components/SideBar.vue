<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import IconLogo from '@/components/icons/IconLogo.vue';
import { Settings } from 'lucide-vue-next';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';
import { sidebarItems as sideBarItemsList } from '@/lib/sidebar-items';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const sidebarItems = ref([...sideBarItemsList]);

const activePath = computed(() => route.path);

const navigate = (path: string) => {
    router.push(path);
};

function handleClick(event: MouseEvent, path: string) {
    // if ctrl/cmd pressed, spawn a new window
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
        window.open(path, '_blank', 'noopener,noreferrer');
        return;
    }
    navigate(path);
}

</script>

<template>
    <!-- For Collapse -->
    <!-- :class="[isCollapsed ? 'w-0' : 'w-16']" -->
    <aside
        class="bg-transparent relative z-30 flex h-full w-16 flex-col border-r transition-all duration-300 ease-in-out select-none"
    >
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
                    <IconLogo />
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
                        @click="handleClick($event, element.path)"
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
                            <component :is="element.icon" :size="28" :stroke-width="activePath === element.path ? 2 : 1.5" />
                        </div>

                        <div
                            class="card invisible absolute left-14 z-999 m-0 ml-2 whitespace-nowrap px-3 py-1.5 text-xs font-mono shadow-xl group-hover:visible"
                        >
                            {{ t(element.label) }}

                            <div
                                class="bg-card border-l border-b border-neutral-200 dark:border-neutral-700 absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45"
                            ></div>
                        </div>
                    </div>
                </template>
            </draggable>

            <div class="mt-auto pb-1 w-full">
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
                        <Settings :size="28" :stroke-width="activePath === '/preferences' ? 2 : 1.5" />
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

    .wco-container > div {
      padding-top: 0;
    }

    .wco-container > * {
        -webkit-app-region: no-drag;
    }
}
</style>
