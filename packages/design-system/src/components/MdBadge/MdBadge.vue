<script setup lang="ts">
interface Props {
  variant?: 'blue' | 'teal' | 'success' | 'warning' | 'error' | 'neutral'
}

withDefaults(defineProps<Props>(), {
  variant: 'blue',
})
</script>

<template>
  <span :class="['md-badge', `md-badge--${variant}`]" v-bind="$attrs">
    <slot />
  </span>
</template>

<style scoped>
.md-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full, 9999px);
  white-space: nowrap;
  line-height: 1.4;
}

.md-badge--blue {
  background: var(--blue-50, #ebf5fb);
  color: var(--blue-600, #3a74a8);
}

.md-badge--teal {
  background: var(--teal-50, #eaf7f5);
  color: var(--teal-700, #2e7870);
}

.md-badge--success {
  background: var(--success-light, #e6f7f2);
  color: var(--success-dark, #1a9068);
}

.md-badge--warning {
  background: var(--warning-light, #fef5e7);
  color: var(--warning-dark, #c47d0e);
}

.md-badge--error {
  background: var(--error-light, #fdecec);
  color: var(--error-dark, #b83333);
}

.md-badge--neutral {
  background: var(--neutral-200, #d6e2ee);
  color: var(--neutral-700, #2d5070);
}
</style>
