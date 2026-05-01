<script setup lang="ts">
interface Props {
  title?: string
  variant?: 'default' | 'feature' | 'mood' | 'streak' | 'accent'
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  interactive: false,
})
</script>

<template>
  <div
    :class="['md-card', `md-card--${variant}`, { 'md-card--interactive': interactive }]"
    v-bind="$attrs"
  >
    <h3 v-if="title" class="md-card__title">{{ title }}</h3>
    <slot />
  </div>
</template>

<style scoped>
.md-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-sm, 0 1px 6px rgba(27, 58, 110, 0.07));
  padding: var(--space-6, 1.5rem);
}

.md-card--interactive {
  cursor: pointer;
  transition:
    box-shadow var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1)),
    transform var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}
.md-card--interactive:hover {
  box-shadow: var(--shadow-md, 0 4px 16px rgba(27, 58, 110, 0.1));
  transform: translateY(-2px);
}

.md-card__title {
  font-family: var(--font-heading, 'Nunito', system-ui, sans-serif);
  font-size: var(--text-lg, 1.375rem);
  font-weight: var(--weight-semibold, 600);
  line-height: var(--leading-snug, 1.35);
  color: var(--color-text-primary, #1b3a6e);
  margin-bottom: var(--space-4, 1rem);
}

/* Feature card */
.md-card--feature {
  border-radius: var(--radius-lg, 16px);
}

/* Accent card */
.md-card--accent {
  background: var(--color-primary, #5b9fd4);
}
.md-card--accent .md-card__title {
  color: #fff;
}
</style>
