<script lang="ts">
import { useRoute, RouterLink } from 'vue-router';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import { Menubar } from '@/components/ui/menubar';

export default {
    name: 'HeaderComponent',
    components: {
        Menubar,
        IconLogo,
        ThemeSwitch,
        RouterLink,
    },
    setup() {
        const route = useRoute();

        const routes = [
            { name: 'Welcome', path: '/' },
            { name: 'Blocks', path: '/blocks' },
            { name: 'Network', path: '/network' },
            { name: 'Editor', path: '/editor' },
            { name: 'Windows', path: '/windows' },
            { name: 'ComHub', path: '/comhub' },
            { name: 'Pointers', path: '/pointers' },
            { name: 'REPL', path: '/repl' },
        ];

        return { route, routes };
    },
};
</script>

<template>
    <Menubar
        class="wco-header bg-background/80 border-border flex w-full items-center px-6 py-3 backdrop-blur-md transition-all duration-300"
    >
        <RouterLink
            to="/"
            class="group flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
        >
            <IconLogo class="text-primary h-6 w-6 transition-colors duration-300" />
            <div class="flex items-baseline space-x-1">
                <span class="text-primary text-lg font-bold tracking-tight"> DATEX Workbench </span>
                <sup class="text-muted-foreground animate-pulse text-xs font-semibold"> beta </sup>
            </div>
        </RouterLink>

        <nav class="ml-8 flex space-x-6">
            <RouterLink
                v-for="r in routes"
                :key="r.path"
                :to="r.path"
                class="text-muted-foreground hover:text-primary relative font-medium transition-colors duration-300"
            >
                {{ r.name }}
                <span
                    class="bg-primary absolute -bottom-1 left-0 h-0.5 w-full scale-x-0 transition-transform duration-300"
                    :class="{ 'scale-x-100': route.path === r.path }"
                ></span>
            </RouterLink>
        </nav>

        <div class="ml-auto flex items-center space-x-4">
            <ThemeSwitch class="btn-icon transition-transform duration-300 hover:scale-110" />
        </div>
    </Menubar>
</template>

<style scoped>
.unyt-blue {
    color: rgb(42, 170, 215);
}

.wco-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    backdrop-filter: blur(
        0px
    ); /* you can add filter here if you want, it can create a 'cool' header, but only if you like it */
    background: transparent;
    transition: all 0.3s ease-in-out;
}

.wco-header a {
    transition:
        color 0.3s ease,
        transform 0.3s ease;
}

.scale-x-0 {
    transform: scaleX(0);
    transform-origin: left;
}
.scale-x-100 {
    transform: scaleX(1);
}

@media (display-mode: window-controls-overlay) {
    .wco-header {
        top: env(titlebar-area-y, 0);
        left: env(titlebar-area-x, 0);
        width: env(titlebar-area-width, 100%);
        height: env(titlebar-area-height, 48px);
        -webkit-app-region: drag;
        padding-left: 0;
    }

    .wco-header :deep(button),
    .wco-header :deep(a),
    .wco-header :deep([role='menuitem']) {
        -webkit-app-region: no-drag;
    }

    .wco-header :deep(img) {
        height: 20px;
        margin-right: 2px;
    }
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}
.animate-pulse {
    animation: pulse 1.5s infinite;
}
</style>
