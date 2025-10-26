<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Menubar, MenubarMenu } from '@/components/ui/menubar'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
</script>

<template>
  <Menubar class="flex items-center w-full bg-background px-4 py-2 shadow-md">
    <MenubarMenu class="flex items-center space-x-8">
      <RouterLink to="/" class="text-foreground hover:text-primary transition-colors mr-4">
        Home
      </RouterLink>
      <RouterLink to="/about" class="text-foreground hover:text-primary transition-colors mx-4">
        About
      </RouterLink>
    </MenubarMenu>
    <div class="ml-auto">
      <ThemeSwitch />
    </div>
  </Menubar>

  <RouterView />
</template>

<style scoped></style>
