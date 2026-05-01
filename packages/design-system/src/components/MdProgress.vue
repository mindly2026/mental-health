<script setup lang="ts">
interface Props {
  value: number
  max?: number
  variant?: 'primary' | 'secondary' | 'gradient'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  max: 100,
  variant: 'primary',
  size: 'md',
})
</script>

<template>
  <div
    :class="['md-progress', `md-progress--${size}`]"
    role="progressbar"
    :aria-valuenow="value"
    :aria-valuemax="max"
    v-bind="$attrs"
  >
    <div
      :class="['md-progress__fill', `md-progress__fill--${variant}`]"
      :style="{ width: `${Math.min((value / (max ?? 100)) * 100, 100)}%` }"
    />
  </div>
</template>

<style scoped>
.md-progress {
  background: var(--neutral-200, #d6e2ee);
  border-radius: 9999px;
  overflow: hidden;
  width: 100%;
}

.md-progress--sm {
  height: 6px;
}
.md-progress--md {
  height: 8px;
}

.md-progress__fill {
  height: 100%;
  border-radius: 9999px;
  transition: width var(--duration-normal, 300ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}

.md-progress__fill--primary {
  background: var(--color-primary, #5b9fd4);
}

.md-progress__fill--secondary {
  background: var(--color-secondary, #62beb0);
}

.md-progress__fill--gradient {
  background: linear-gradient(
    90deg,
    var(--color-primary, #5b9fd4),
    var(--color-secondary, #62beb0)
  );
}
</style>
