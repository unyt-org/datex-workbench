<script setup lang="ts">
import { usePointerPreferences } from '@/composables/usePointerPreferences'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  PopoverContent,
} from '@/components/ui/popover'

const { preferences, resetPreferences } = usePointerPreferences()
</script>

<template>
  <PopoverContent class="w-80" align="start">
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h4 class="font-medium leading-none">Display Preferences</h4>
          <p class="text-sm text-muted-foreground">
            Customize how pointers are displayed
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="resetPreferences"
          class="h-8 px-2 text-xs"
        >
          Reset
        </Button>
      </div>

      <!-- Preferences List -->
      <div class="space-y-4">
        <!-- Show Full Pointer IDs -->
        <div class="flex items-center justify-between space-x-2">
          <div class="flex flex-col space-y-1 flex-1">
            <label class="font-medium text-sm cursor-pointer">
              Full Pointer IDs
            </label>
            <span class="text-xs text-muted-foreground">
              Show complete pointer identifiers instead of shortened versions
            </span>
          </div>
          <Switch 
            v-model="preferences.show_full_pointer_ids"
            id="show-full-ids"
          />
        </div>

        <!-- Show Type Hints -->
        <div class="flex items-center justify-between space-x-2">
          <div class="flex flex-col space-y-1 flex-1">
            <label class="font-medium text-sm cursor-pointer">
              Type Hints
            </label>
            <span class="text-xs text-muted-foreground">
              Display type annotations for values
            </span>
          </div>
          <Switch 
            v-model="preferences.show_type_hints"
            id="show-type-hints"
          />
        </div>

        <!-- Show Array Indices -->
        <div class="flex items-center justify-between space-x-2">
          <div class="flex flex-col space-y-1 flex-1">
            <label class="font-medium text-sm cursor-pointer">
              Array Indices & Keys
            </label>
            <span class="text-xs text-muted-foreground">
              Show array indices and object keys
            </span>
          </div>
          <Switch 
            v-model="preferences.show_array_indicies"
            id="show-array-indices"
          />
        </div>

        <!-- Hide Type Hints for Primitives -->
        <div class="flex items-center justify-between space-x-2">
          <div class="flex flex-col space-y-1 flex-1">
            <label class="font-medium text-sm cursor-pointer">
              Hide Primitive Type Hints
            </label>
            <span class="text-xs text-muted-foreground">
              Hide type hints for integers, booleans, and text (show for maps/arrays)
            </span>
          </div>
          <Switch 
            v-model="preferences.hide_type_hints_for_primitives"
            id="hide-primitive-hints"
          />
        </div>
      </div>
    </div>
  </PopoverContent>
</template>
