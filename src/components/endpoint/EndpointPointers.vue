<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <section class="flex flex-col gap-3">
        <h2 class="text-primary text-sm font-medium">{{ t('endpoint.pointerView') }}</h2>
        <div class="text-dim text-sm italic">{{ t('endpoint.noPointersLoaded') }}</div>
    </section>
</template>
