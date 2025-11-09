<script lang="ts">
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import IconLogo from '@/components/icons/IconLogo.vue';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
export default {
  name: 'HeaderComponent',
  components: {
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarSub,
    MenubarItem,
    MenubarContent,
    MenubarTrigger,
    MenubarMenu,
    Menubar,
    IconLogo,
    ThemeSwitch,
  },
};
</script>

<template>
  <Menubar class="flex items-center w-full bg-background px-4 py-2">
    <RouterLink
      to="/"
      class="flex items-center space-x-2 group mr-4 border-primary transition-all hover:border-b-2 border-b-primary"
    >
      <IconLogo class="w-8 h-8" />
      <div class="flex items-baseline space-x-1">
        <span class="text-lg font-bold text-foreground">DATEX Workbench</span>
        <span class="text-xs unyt-blue font-semibold">beta</span>
      </div>
    </RouterLink>

    <MenubarMenu class="flex items-center ml-8 space-x-4">
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>New tab</MenubarItem>
        <MenubarItem>New window</MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Share</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>Email</MenubarItem>
            <MenubarItem>Link</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem>Save</MenubarItem>
        <MenubarItem>Save all</MenubarItem>
        <MenubarItem>Close window</MenubarItem>
        <MenubarItem>Close all</MenubarItem>
        <MenubarItem>Preferences</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Undo</MenubarItem>
        <MenubarItem>Redo</MenubarItem>
        <MenubarItem>Find</MenubarItem>
        <MenubarItem>Cut</MenubarItem>
        <MenubarItem>Copy</MenubarItem>
        <MenubarItem>Paste</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Reload</MenubarItem>
        <MenubarItem>Toggle Fullscreen</MenubarItem>
        <MenubarItem>Hide / Expand Sidebar</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <div class="ml-auto">
      <ThemeSwitch />
    </div>
  </Menubar>
</template>

<style scoped>
.unyt-blue {
  color: rgb(42, 170, 215);
}
</style>
