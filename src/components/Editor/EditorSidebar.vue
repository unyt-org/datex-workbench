<script setup lang="ts">
import { File } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

// Props
interface Props {
  files: string[];
  currentFile?: string;
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  fileClick: [filename: string];
}>();

// Handle file click
function handleFileClick(filename: string) {
  emit('fileClick', filename);
}
</script>

<template>
  <div class="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-sidebar-border">
      <h2 class="text-sm font-semibold text-sidebar-foreground">Files</h2>
    </div>

    <!-- File List -->
    <div class="flex-1 overflow-y-auto p-2">
      <button
        v-for="file in files"
        :key="file"
        @click="handleFileClick(file)"
        :class="cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          file === currentFile
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground'
        )"
      >
        <File class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ file }}</span>
      </button>
    </div>
  </div>
</template>
