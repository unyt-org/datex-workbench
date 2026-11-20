<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TriangleAlertIcon } from '@lucide/vue';
import { ref } from 'vue';
const props = defineProps<{ error: unknown }>();

const datexRuntimePatch = ref(localStorage.getItem('localDatexModuleUrl') || undefined);
let message = props.error instanceof Error ? props.error.message : String(props.error);

if (message.startsWith("Failed to fetch dynamically imported module")) {
    message = "Failed to load the DATEX runtime";
}

function reload() {
    if (datexRuntimePatch.value) {
        localStorage.setItem('localDatexModuleUrl', datexRuntimePatch.value);
    }
    else {
        localStorage.removeItem('localDatexModuleUrl');
    }
    location.reload();
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center p-6 bg-background">
        <Card class="w-full max-w-md space-y-4 border-2 border-rose-600/60">
            <CardContent>
              <h1 class="text-xl font-semibold mb-3 flex items-center gap-2">
                <TriangleAlertIcon/>
                DATEX Workbench could not be loaded
              </h1>

              <pre class="overflow-x-auto rounded bg-rose-100 text-rose-500 p-3 mb-2 w-full text-sm whitespace-pre-wrap dark:bg-rose-600/60 dark:text-rose-100">{{ message }}</pre>

              <div class="mb-4">
                <Label>
                  <span>Custom DATEX runtime patch:</span>
                  <Input v-model="datexRuntimePatch" class="mt-1" placeholder="Enter a custom DATEX runtime URL" />
                </Label>
              </div>


              <div class="flex gap-2 justify-end">
                  <Button
                      @click="reload"
                  >
                      {{ datexRuntimePatch ? 'Use custom DATEX runtime' : 'Use default DATEX runtime' }}
                  </Button>
              </div>
            </CardContent>
        </Card>
    </div>
</template>
