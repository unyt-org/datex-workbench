<script setup lang="ts">
import { usePointerPreferences } from '@/composable/usePointerPreferences';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PopoverContent } from '@/components/ui/popover';
import { useI18n } from 'vue-i18n';

const { preferences, resetPreferences } = usePointerPreferences();
const { t } = useI18n();
</script>

<template>
    <PopoverContent class="w-80" align="start">
        <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="space-y-1">
                    <h4 class="leading-none font-medium">{{ t('pointer.displayPreferences') }}</h4>
                    <p class="text-muted-foreground text-sm">
                        {{ t('pointer.customizeDisplay') }}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    @click="resetPreferences"
                    class="h-8 px-2 text-xs"
                >
                    {{ t('common.reset') }}
                </Button>
            </div>

            <!-- Preferences List -->
            <div class="space-y-4">
                <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-1 flex-col space-y-1">
                        <label class="cursor-pointer text-sm font-medium">
                            {{ t('pointer.fullPointerIds') }}
                        </label>
                        <span class="text-muted-foreground text-xs">
                            {{ t('pointer.fullPointerIdsDesc') }}
                        </span>
                    </div>
                    <Switch v-model="preferences.show_full_pointer_ids" id="show-full-ids" />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-1 flex-col space-y-1">
                        <label class="cursor-pointer text-sm font-medium">
                            {{ t('pointer.typeHints') }}
                        </label>
                        <span class="text-muted-foreground text-xs">
                            {{ t('pointer.typeHintsDesc') }}
                        </span>
                    </div>
                    <Switch v-model="preferences.show_type_hints" id="show-type-hints" />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-1 flex-col space-y-1">
                        <label class="cursor-pointer text-sm font-medium">
                            {{ t('pointer.arrayIndicesKeys') }}
                        </label>
                        <span class="text-muted-foreground text-xs">
                            {{ t('pointer.arrayIndicesKeysDesc') }}
                        </span>
                    </div>
                    <Switch v-model="preferences.show_array_indicies" id="show-array-indices" />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-1 flex-col space-y-1">
                        <label class="cursor-pointer text-sm font-medium">
                            {{ t('pointer.hidePrimitiveTypeHints') }}
                        </label>
                        <span class="text-muted-foreground text-xs">
                            {{ t('pointer.hidePrimitiveTypeHintsDesc') }}
                        </span>
                    </div>
                    <Switch
                        v-model="preferences.hide_type_hints_for_primitives"
                        id="hide-primitive-hints"
                    />
                </div>

                <div class="flex items-center justify-between space-x-2">
                    <div class="flex flex-1 flex-col space-y-1">
                        <label class="cursor-pointer text-sm font-medium">
                            {{ t('pointer.hideMapKeyPrimitiveTypeHints') }}
                        </label>
                        <span class="text-muted-foreground text-xs">
                            {{ t('pointer.hideMapKeyPrimitiveTypeHintsDesc') }}
                        </span>
                    </div>
                    <Switch
                        v-model="preferences.hide_map_key_type_hints_for_primitives"
                        id="hide-map-key-primitive-hints"
                    />
                </div>
            </div>
        </div>
    </PopoverContent>
</template>
