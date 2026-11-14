<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { activeEndpoint, activeInspector } from '@/lib/inspector/mod';
import EndpointLabel from '@/components/Endpoints/EndpointLabel.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { DatabaseZapIcon, MemoryStickIcon, TagIcon, TagsIcon } from 'lucide-vue-next';
import { endpointPings as endpointRtts } from '@/lib/composables/use-endpoint-connection-status';
import type { RuntimeStats } from '@/lib/_temp_types';
import { onUnmounted } from 'vue';
import ProgressBar from '@/components/CustomUI/ProgressBar.vue';
import EndpointSearch from '@/components/Endpoints/EndpointSearch.vue';
import StandaloneWindowHeader from '@/components/Endpoints/StandaloneWindowHeader.vue';

const { t } = useI18n();

const info = computed(() => activeInspector.value.info);
const rtt = computed(() => endpointRtts.value.get(activeEndpoint.value) ?? 0)

const runtimeStats = ref<RuntimeStats|null>(null);

async function updateRuntimeStats() {
  if (activeInspector.value) {
    runtimeStats.value = await activeInspector.value.stats();
  }
}
// refetch every 5 seconds
const id = setInterval(updateRuntimeStats, 5000);

// also fetch when a new inspector becomes active
watch(activeInspector, () => {
  runtimeStats.value = null;
  updateRuntimeStats();
});

onMounted(updateRuntimeStats);
onUnmounted(() => clearInterval(id));

const currentHeapUsage = computed(() => {
  if (runtimeStats.value?.heap) {
    return (runtimeStats.value.heap.used / runtimeStats.value.heap.total) * 100;
  }
  return 0;
});
const maxHeapUsage = computed(() => {
  if (runtimeStats.value?.heap) {
    return (runtimeStats.value.heap.max_used / runtimeStats.value.heap.total) * 100;
  }
  return 0;
});

const currentHeapColors = computed(() => {
  if (currentHeapUsage.value > 70) {
    return { text: 'text-yellow-500', bg: 'bg-yellow-500' };
  }
  if (currentHeapUsage.value > 90) {
    return { text: 'text-rose-500', bg: 'bg-rose-500' };
  }
  return { text: 'text-foreground', bg: 'bg-primary' };
});

const peakHeapColors = computed(() => {
  if (maxHeapUsage.value > 70) {
    return { text: 'text-yellow-600', bg: 'bg-yellow-600' };
  }
  if (maxHeapUsage.value > 90) {
    return { text: 'text-rose-600', bg: 'bg-rose-600' };
  }
  return { text: 'text-blue-400', bg: 'bg-blue-400' };
});

</script>

<template>
    <StandaloneWindowHeader alwaysVisible :title="t('about.title')"/>
    <div class="flex flex-col h-full w-full items-center justify-center p-4">

        <div class="w-full max-w-xl rounded-xl bg-muted/30 p-6 no-drag">
            <h1 class="text-xl font-semibold mb-1 text-foreground">
              <EndpointLabel :endpoint="activeEndpoint" variant="colored-name"/>
            </h1>

             <div class="text-muted-foreground mb-4 text-sm">
              Running since {{ new Date(Number(info.running_since)).toLocaleDateString('de-DE') + ' ' + new Date(Number(info.running_since)).toLocaleTimeString('de-DE') }}
              &bull;
              RTT {{Math.round(rtt)}}ms
            </div>

            <div class="flex flex-col gap-2 bg-muted/20 p-4 rounded-lg">
              <div v-if="info.device_type" class="flex gap-1">
                  <span class="text-foreground font-semibold flex items-center gap-2">
                    <MemoryStickIcon class="w-5 h-5"/>
                    {{ t('about.device') }}:
                   </span>
                  <span class="text-muted-foreground select-all">{{ info.device_type }}</span>
              </div>

              <div class="flex gap-1">
                  <span class="text-foreground font-semibold flex items-center gap-2">
                    <TagIcon class="w-5 h-5"/>
                    {{ t('about.datexVersion') }}:
                   </span>
                  <span class="text-muted-foreground select-all">{{ info.datex_version }}</span>
              </div>
              <div v-if="info.other_versions.size > 0" class="flex flex-col gap-1">
                  <span class="text-foreground font-semibold flex items-center gap-2">
                    <TagsIcon class="w-5 h-5"/>
                    {{ t('about.otherVersions') }}:
                  </span>
                  <ul class="text-muted-foreground">
                      <li v-for="[key, version] in info.other_versions.entries()" :key="key" class="ml-11 list-disc">
                          <span class="text-foreground">{{ key }}</span>: <span class="select-all">{{ version }}</span>
                      </li>
                  </ul>
              </div>
            </div>

            <div v-if="runtimeStats?.heap" class="flex flex-col gap-2 bg-muted/20 p-4 rounded-lg mt-4">
              <span class="text-foreground font-semibold flex items-center gap-2">
                <DatabaseZapIcon class="w-5 h-5"/>
                {{ t('about.heapUsage') }}
              </span>
              <ProgressBar animated
                  :value="currentHeapUsage"
                  :secondaryValue="maxHeapUsage"
                  :classPrimary="currentHeapColors.bg"
                  :classSecondary="peakHeapColors.bg"
              />
              <div class="flex gap-3 text-muted-foreground text-sm">
                  <span :class="currentHeapColors.text">{{ (runtimeStats.heap.used / 1024).toFixed(2) }} KiB used</span>/
                  <span :class="peakHeapColors.text">{{ (runtimeStats.heap.max_used / 1024).toFixed(2) }} KiB peak</span>/
                  <span>{{ (runtimeStats.heap.total / 1024).toFixed(2) }} KiB total</span>
              </div>
            </div>
        </div>
    </div>
</template>
