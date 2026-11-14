<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import BlockIcons from '../BlockIcons.vue';

defineProps<{
    value: string;
    isEncrypted?: boolean;
    isSigned?: boolean;
    isDebug?: boolean;
    searchTerms?: string[];
}>();

const { t } = useI18n();
</script>

<template>
    <div v-if="value" class="flex items-center gap-2">
        <HighlightedText
            :text="value"
            :searchTerms="searchTerms ?? []"
            class="font-medium uppercase"
        />
        <BlockIcons
            :isEncrypted="isEncrypted"
            :isSigned="isSigned"
            :isDebug="isDebug"
        />
    </div>
</template>
