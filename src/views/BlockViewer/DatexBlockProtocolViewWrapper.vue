<!-- this is a temporary wrapper file that statically fetches an example block.bin file -->
<!-- this will later on be done by passing the prop accordingly when needed -->
<script setup lang="ts">
import DatexBlockProtocolView from './DatexBlockProtocolView.vue';

const blockData: Uint8Array = new Uint8Array(
    await (
        await fetch(
            'https://raw.githubusercontent.com/unyt-org/datex-core/main/crates/datex-core/tests/structs/receivers/block.bin',
        )
    ).arrayBuffer(),
);
</script>

<template>
    <DatexBlockProtocolView :blockData="blockData" />
</template>
