<script setup lang="ts">
import { LockOpen, FileX } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';

const props = defineProps<{
    value: string;
    isEncrypted?: boolean;
    isSigned?: boolean;
    searchTerms?: string[];
}>();

const { t } = useI18n();
</script>

<template>
    <div v-if="props.value" class="flex items-center gap-2">
        <HighlightedText
            :text="props.value"
            :searchTerms="props.searchTerms ?? []"
            class="font-medium uppercase"
        />
        <TooltipWrapper v-if="!props.isEncrypted" :tooltip="t('network.notEncrypted')">
            <div class="inline-block cursor-default">
                <LockOpen class="text-muted-foreground h-4 w-4 line-through" />
            </div>
        </TooltipWrapper>
        <TooltipWrapper v-if="!props.isSigned" :tooltip="t('network.notSigned')">
            <div class="inline-block cursor-default">
                <FileX class="text-muted-foreground h-4 w-4" />
            </div>
        </TooltipWrapper>
    </div>
</template>
