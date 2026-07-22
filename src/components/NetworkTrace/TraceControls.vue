<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue-sonner';
import { Datex } from '@/lib/runtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { traceToNodeTree } from '@/composable/NetworkTrace/traceToNodeTree';
import type { NodeTree } from '@/types/NodeTree/node-tree.ts';

const props = defineProps<{
    currentTree: NodeTree | null;
}>();

const emit = defineEmits<{
    'trace-result': [tree: NodeTree];
}>();

const endpoint = ref('@example');
const timeout = ref(5000);
const isTracing = ref(false);
const isAutoTracing = ref(false);

async function sendTrace() {
    isTracing.value = true;
    try {
        const result = await Datex.comHub.getTrace(endpoint.value);
        if (result === undefined) {
            toast.error('Endpoint not reachable!');
            return;
        }
        const tree = traceToNodeTree(result, props.currentTree ?? undefined);
        emit('trace-result', tree);
    } catch (err) {
        console.error('trace error:', err);
    } finally {
        isTracing.value = false;
    }
}

async function autoTrace() {
    isAutoTracing.value = true;
    try {
        const metadata = await Datex.comHub.getMetadata();
        if (metadata === undefined) {
            toast.error('Endpoint not reachable!');
            return;
        }
        // Extract unique endpoints from all interface sockets
        const endpoints = new Set<string>();
        for (const iface of metadata.interfaces ?? []) {
            for (const socket of iface.sockets ?? []) {
                if (socket.endpoint && socket.endpoint.toString() !== '@@local') {
                    endpoints.add(socket.endpoint.toString());
                }
            }
        }

        let currentTree = props.currentTree ?? undefined;
        for (const ep of endpoints) {
            try {
                const result = await Datex.comHub.getTrace(ep);
                if (result === undefined) {
                    toast.error(`Endpoint ${ep} not reachable`);
                    continue;
                }
                currentTree = traceToNodeTree(result, currentTree);
            } catch {
                toast.error(`Trace failed for ${ep}`);
            }
        }
        if (currentTree) emit('trace-result', currentTree);
    } catch {
        toast.error('Auto-trace Failed:');
    } finally {
        isAutoTracing.value = false;
    }
}
</script>

<template>
    <div class="flex items-center gap-2 p-4 border-b border-border top-offset">
        <Input v-model="endpoint" placeholder="@endpoint" class="w-48 text-foreground" />
        <Input
            v-model.number="timeout"
            type="number"
            placeholder="Timeout (ms)"
            class="w-32 opacity-50 cursor-not-allowed text-foreground"
            disabled
            title="Timeout not yet supported by the DATEX runtime"
        />
        <Button @click="sendTrace" :disabled="isTracing || isAutoTracing">
            {{ isTracing ? 'Tracing...' : 'Trace' }}
        </Button>
        <Button
            @click="autoTrace"
            variant="outline"
            :disabled="isAutoTracing || isTracing"
            class="text-foreground"
        >
            {{ isAutoTracing ? 'Auto-Tracing...' : 'Auto-Trace' }}
        </Button>
    </div>
</template>
