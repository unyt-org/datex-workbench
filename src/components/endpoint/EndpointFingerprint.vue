<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
    fingerprint?: string;
    endpointId?: string;
}

const props = defineProps<Props>();

const { t } = useI18n();

const fingerprintText = computed(() => {
    if (!props.fingerprint) return t('common.unavailable');

    if (typeof props.fingerprint === 'string') {
        return props.fingerprint;
    }

    // Object case → pretty JSON (future-proof)
    return JSON.stringify(props.fingerprint, null, 2);
});

const downloadFingerprint = () => {
    if (!props.fingerprint) return;

    const content =
        typeof props.fingerprint === 'string'
            ? props.fingerprint
            : JSON.stringify(props.fingerprint, null, 2);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.endpointId ?? 'endpoint'}-public-key.json`;
    a.click();

    URL.revokeObjectURL(url);
};
</script>

<template>
    <section class="flex flex-col gap-2">
        <h2 class="text-primary text-sm font-medium">{{ t('endpoint.fingerprint') }}</h2>

        <div class="bg-subtle flex items-start justify-between gap-3 rounded p-3">
            <pre class="text-primary text-xs break-all whitespace-pre-wrap"
                >{{ fingerprintText }}
      </pre
            >

            <button
                class="border-card text-dim shrink-0 rounded px-3 py-1.5 text-xs transition hover:bg-neutral-200 dark:hover:bg-neutral-700"
                :disabled="!props.fingerprint"
                @click="downloadFingerprint"
            >
                {{ t('common.download') }}
            </button>
        </div>
    </section>
</template>
