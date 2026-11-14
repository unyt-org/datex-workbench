<script setup lang="ts">
import { LockOpen, FileX, ScanEyeIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import TooltipWrapper from '@/components/NetworkInspector/TooltipWrapper.vue';

defineProps<{
    isEncrypted?: boolean;
    isSigned?: boolean;
    isDebug?: boolean;
}>();

const { t } = useI18n();
</script>

<template>
  <TooltipWrapper v-if="!isEncrypted" :tooltip="t('network.notEncrypted')">
      <div class="cursor-default flex">
          <LockOpen class="text-muted-foreground h-4 w-4 line-through" />
      </div>
  </TooltipWrapper>
  <TooltipWrapper v-if="isDebug" :tooltip="t('network.debugBlock')">
      <div class="cursor-default flex">
          <ScanEyeIcon class="text-muted-foreground h-4 w-4" />
      </div>
  </TooltipWrapper>
  <TooltipWrapper v-if="!isSigned" :tooltip="t('network.notSigned')">
      <div class="cursor-default flex">
          <FileX class="text-muted-foreground h-4 w-4" />
      </div>
  </TooltipWrapper>
</template>
