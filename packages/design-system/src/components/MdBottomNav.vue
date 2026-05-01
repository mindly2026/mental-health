<script setup lang="ts">
import type { NavItem } from '../types'

interface Props {
  items: NavItem[]
  modelValue?: string
}

withDefaults(defineProps<Props>(), {
  items: () => [],
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <nav class="md-bottom-nav" v-bind="$attrs">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :class="['md-nav-item', { 'md-nav-item--active': modelValue === item.value }]"
      @click="$emit('update:modelValue', item.value)"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="md-nav-item__icon" v-html="item.icon" />
      <span class="md-nav-item__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.md-bottom-nav {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 24px);
  padding: 10px 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: var(--shadow-lg, 0 12px 40px rgba(27, 58, 110, 0.14));
}

.md-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 60px;
  padding: 6px 8px;
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background var(--duration-fast, 200ms)
    var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}

.md-nav-item:hover {
  background: var(--blue-50, #ebf5fb);
}

.md-nav-item__icon {
  display: flex;
  color: var(--neutral-400, #8baec8);
  transition: color var(--duration-fast, 200ms);
}

.md-nav-item__label {
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 10px;
  color: var(--neutral-400, #8baec8);
  transition: color var(--duration-fast, 200ms);
}

.md-nav-item--active .md-nav-item__icon {
  color: var(--color-primary, #5b9fd4);
}

.md-nav-item--active .md-nav-item__label {
  color: var(--color-primary, #5b9fd4);
  font-weight: 600;
}
</style>
