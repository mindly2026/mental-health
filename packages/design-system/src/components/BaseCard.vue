<script setup lang="ts">
interface Props {
  title?: string | undefined
}

withDefaults(defineProps<Props>(), {
  title: undefined,
})
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div v-if="title" class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">{{ title }}</h3>
    </div>
    <div class="p-6 pt-0">
      <slot />
    </div>
  </div>
</template>
