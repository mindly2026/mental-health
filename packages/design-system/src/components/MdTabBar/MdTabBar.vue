<script setup lang="ts">
interface Props {
  tabs: string[]
  modelValue?: string
}

defineProps<Props>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="md-tab-bar" v-bind="$attrs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab"
      type="button"
      role="tab"
      :class="['md-tab', { 'md-tab--active': modelValue === tab }]"
      :aria-selected="modelValue === tab"
      @click="$emit('update:modelValue', tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>

<style scoped>
.md-tab-bar {
  display: flex;
  gap: 4px;
  background: var(--neutral-100, #ebf0f7);
  border-radius: var(--radius-full, 9999px);
  padding: 4px;
}

.md-tab {
  flex: 1;
  text-align: center;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--radius-full, 9999px);
  cursor: pointer;
  color: var(--color-text-muted, #8baec8);
  border: none;
  background: transparent;
  transition: all var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
  white-space: nowrap;
}

.md-tab--active {
  background: var(--color-surface, #ffffff);
  color: var(--color-primary, #5b9fd4);
  font-weight: 600;
  box-shadow: var(--shadow-sm, 0 1px 6px rgba(27, 58, 110, 0.07));
}
</style>
