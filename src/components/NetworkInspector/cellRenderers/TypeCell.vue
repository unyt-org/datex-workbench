<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community';
import type { NetworkBlockTableRow } from '@/types/NetworkInspector/TableRow';
import { LockOpen, FileX } from 'lucide-vue-next';
import HighlightedText from '@/components/NetworkInspector/HighlightedText.vue';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';

interface Props {
    params: ICellRendererParams<NetworkBlockTableRow> & { searchTerms?: string[] };
}

const props = defineProps<Props>();
const blockType = props.params.value as string;
const isEncrypted = props.params.data?.isEncrypted;
const isSigned = props.params.data?.isSigned;
const searchTerms = props.params.searchTerms || [];
</script>

<template>
    <div v-if="blockType" class="flex items-center gap-2">
        <HighlightedText 
            :text="blockType"
            :searchTerms="searchTerms"
            class="font-medium uppercase"
        />
        <TooltipWrapper v-if="!isEncrypted" tooltip="Not encrypted">
            <div class="inline-block cursor-default">
                <LockOpen class="h-4 w-4 text-muted-foreground line-through" />
            </div>
        </TooltipWrapper>
        <TooltipWrapper v-if="!isSigned" tooltip="Not signed">
            <div class="inline-block cursor-default">
                <FileX class="h-4 w-4 text-muted-foreground" />
            </div>
        </TooltipWrapper>
    </div>
</template>
