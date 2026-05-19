<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from 'vue-i18n';
import { useColorMode } from '@vueuse/core';
import { Moon, Sun } from 'lucide-vue-next';
import { watch } from 'vue';

const { t } = useI18n();
const mode = useColorMode();

// on color mode change, update the meta theme-color
watch(
    mode,
    (newMode) => {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        console.log('Updating theme-color meta tag to match new color mode:', newMode);
        if (themeColorMeta) {
            if (newMode === 'dark') {
                themeColorMeta.setAttribute('content', 'oklch(0.145 0 0)');
            } else {
                themeColorMeta.setAttribute('content', 'oklch(1 0 0)');
            }
        }
    },
    { immediate: true },
);
</script>

<template>
    <DropdownMenu class="z-1000 no-drag">
        <DropdownMenuTrigger as-child>
            <Button variant="ghost">
                <Moon
                    class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                />
                <Sun
                    class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                />
                <span class="sr-only">{{ t('theme.toggle') }}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="no-drag ml-2">
            <DropdownMenuItem @click="mode = 'light'"> {{ t('theme.light') }} </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'dark'"> {{ t('theme.dark') }} </DropdownMenuItem>
            <DropdownMenuItem @click="mode = 'auto'"> {{ t('theme.system') }} </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>

<style scoped></style>
