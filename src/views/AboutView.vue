<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Datex } from '@/lib/runtime';

const { t } = useI18n();

const features = [{ key: 'network.title' }, { key: 'nav.block' }, { key: 'nav.nodeView' }];
</script>

<template>
    <div class="flex h-full w-full items-center justify-center p-6">
        <div class="w-full max-w-xl rounded-xl bg-muted/30 p-8 text-sm">
            <h1 class="text-lg font-semibold mb-4 text-foreground">{{ t('about.title') }}</h1>

            <div class="mb-2">
                <span class="text-foreground">{{ t('about.datexVersion') }}: </span>
                <span class="text-muted-foreground">{{ Datex.version }}</span>
            </div>
            <div class="mb-2">
                <span class="text-foreground">{{ t('about.jsVersion') }}: </span>
                <span class="text-muted-foreground">{{ Datex.js_version }}</span>
            </div>
            <div class="mb-4">
                <span class="text-foreground">{{ t('about.endpoint') }}: </span>
                <span class="text-muted-foreground">{{ Datex.endpoint.toString() }}</span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span class="text-foreground font-semibold">{{ t('about.activeFeatures') }}:</span>
                <span
                    v-for="feature in features"
                    :key="feature.key"
                    class="rounded-full border border-border px-2 py-0.5 text-xs text-foreground"
                >
                    {{ t(feature.key) }}
                </span>
            </div>
        </div>
    </div>
</template>
