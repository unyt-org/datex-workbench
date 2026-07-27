<script setup lang="ts">
import DecompilerView from '@/components/Decompiler/DecompilerView.vue';
import { Datex } from '@/lib/runtime.ts';
import { FoldVertical, GitFork, List, UnfoldVertical } from 'lucide-vue-next';
import { computed, ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import InstructionFlatItem from './InstructionFlatItem.vue';
import InstructionTreeNode from './InstructionTreeNode.vue';

const { t } = useI18n();

const viewType = ref<'disassembler' | 'decompiler'>('disassembler');

type ViewMode = 'tree' | 'flat';

const props = defineProps<{
    /** Raw DXB body bytes to disassemble */
    dxb: Uint8Array;
}>();

const viewMode = ref<ViewMode>('tree');
const showNested = ref(true);

// ─── Disassembly ────────────────────────────────────────────
const treeData = computed(() => Datex.disassembleDXBTree(props.dxb));
const flatData = computed(() => Datex.disassembleDXBFlat(props.dxb));

const error = computed(() => (viewMode.value === 'tree' ? treeData.value[1] : flatData.value[1]));

let decompiledCode: ComputedRef<string> | string = '';
try {
    // @ts-expect-error xxxx
    decompiledCode = computed(() => Datex.decompileDXBBody(props.dxb));
} catch (err) {
    console.error('Decompiler error:', err);
    decompiledCode = '// Error during decompilation';
}
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Controls bar -->
        <div
            class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-800/60 flex-none z-10 min-h-12"
        >
            <div class="flex items-center gap-3">
                <button
                    class="text-xs font-semibold tracking-wide cursor-pointer"
                    :class="
                        viewType === 'disassembler'
                            ? 'text-foreground'
                            : 'text-gray-500 hover:text-gray-400'
                    "
                    @click="viewType = 'disassembler'"
                >
                    {{ t('disassembler.disassembler') }}
                </button>
                <button
                    class="text-xs font-semibold tracking-wide cursor-pointer"
                    :class="
                        viewType === 'decompiler'
                            ? 'text-foreground'
                            : 'text-gray-500 hover:text-gray-400'
                    "
                    @click="viewType = 'decompiler'"
                >
                    {{ t('disassembler.decompiler') }}
                </button>
            </div>

            <div v-if="viewType === 'disassembler'" class="flex items-center gap-1.5">
                <!-- Tree / Flat toggle -->
                <button
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
                    :class="
                        viewMode === 'tree'
                            ? 'text-foreground border-foreground/30 bg-foreground/5'
                            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'
                    "
                    @click="viewMode = 'tree'"
                >
                    <GitFork class="size-3.5" />
                    {{ t('disassembler.tree') }}
                </button>
                <button
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
                    :class="
                        viewMode === 'flat'
                            ? 'text-foreground border-foreground/30 bg-foreground/5'
                            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'
                    "
                    @click="viewMode = 'flat'"
                >
                    <List class="size-3.5" />
                    {{ t('disassembler.flat') }}
                </button>

                <!-- Separator -->
                <div class="w-px h-5 bg-gray-700/50 mx-1" />

                <!-- Nested toggle -->
                <button
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono cursor-pointer transition-all duration-150"
                    :class="
                        showNested
                            ? 'text-foreground border-foreground/30 bg-foreground/5'
                            : 'text-gray-500 border-gray-700/50 bg-transparent hover:text-gray-700 hover:border-gray-600'
                    "
                    @click="showNested = !showNested"
                >
                    <UnfoldVertical v-if="showNested" class="size-3.5" />
                    <FoldVertical v-else class="size-3.5" />
                    {{ t('disassembler.nested') }}
                </button>
            </div>
        </div>

        <!-- Disassembler view -->
        <div v-if="viewType === 'disassembler'" class="flex-1 min-h-0 overflow-y-auto p-4">
            <!-- Instruction view -->
            <div>
                <!-- Tree mode -->
                <template v-if="viewMode === 'tree' && treeData[0]">
                    <InstructionTreeNode :node="treeData[0]" :show-nested="showNested" />
                </template>

                <!-- Flat mode -->
                <template v-else-if="viewMode === 'flat' && flatData[0]">
                    <InstructionFlatItem
                        v-for="(inst, i) in flatData[0]"
                        :key="i"
                        :instruction="inst"
                        :show-nested="showNested"
                    />
                </template>

                <!-- Empty state -->
                <div v-else class="text-gray-500 italic text-sm font-mono">
                    {{ t('disassembler.noInstructions') }}
                </div>
            </div>
        </div>

        <!-- Decompiler view -->
        <div v-else class="flex-1 min-h-0 overflow-y-auto">
            <DecompilerView :code="decompiledCode" />
        </div>

        <!-- Error banner -->
        <div
            v-if="error"
            class="mx-4 mb-3 px-3 py-2 rounded-md border text-sm font-mono bg-red-950/40 border-red-900/60 text-red-300"
        >
            ⚠ {{ error }}
        </div>
    </div>
</template>
