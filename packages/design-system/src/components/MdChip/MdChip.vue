<script setup lang="ts">
interface Props {
  active?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :class="['md-chip', { 'md-chip--active': active, 'md-chip--disabled': disabled }]"
    :disabled="disabled"
    type="button"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.md-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: var(--radius-full, 9999px);
  cursor: pointer;
  border: 1.5px solid var(--color-border, #a8d4e8);
  background: var(--color-surface, #ffffff);
  color: var(--color-text-secondary, #456f90);
  transition: all var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
  white-space: nowrap;
  line-height: 1;
}

.md-chip:hover:not(:disabled) {
  border-color: var(--color-primary, #5b9fd4);
  color: var(--color-primary, #5b9fd4);
  background: var(--blue-50, #ebf5fb);
}

.md-chip--active {
  border-color: var(--color-primary, #5b9fd4);
  background: var(--blue-50, #ebf5fb);
  color: var(--color-primary, #5b9fd4);
  font-weight: 600;
}

.md-chip--disabled,
.md-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
