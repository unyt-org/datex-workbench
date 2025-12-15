<script setup lang="ts">
import { useNetworkInspector } from '@/composable/useNetworkInspector';
import { Button } from '@/components/ui/button';

const { sendTestBlock } = useNetworkInspector();
</script>

<template>
    <div class="flex h-full items-center justify-center">
        <Button @click="sendTestBlock">Simulate</Button>
    </div>
</template>
