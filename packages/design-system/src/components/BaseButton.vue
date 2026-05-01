<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  icon: false,
  disabled: false,
  loading: false,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'md-btn',
      `md-btn--${variant}`,
      `md-btn--${size}`,
      { 'md-btn--icon': icon, 'md-btn--disabled': disabled || loading },
    ]"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.md-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
  white-space: nowrap;
  text-decoration: none;
  line-height: 1;
}

/* Sizes */
.md-btn--sm {
  font-size: 13px;
  padding: 8px 16px;
  border-radius: var(--radius-full, 9999px);
}
.md-btn--md {
  font-size: 15px;
  padding: 12px 24px;
  border-radius: var(--radius-full, 9999px);
}
.md-btn--lg {
  font-size: 16px;
  padding: 14px 32px;
  border-radius: var(--radius-full, 9999px);
}

/* Icon button */
.md-btn--icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: var(--radius-full, 9999px);
  font-size: 18px;
}

/* Variants */
.md-btn--primary {
  background: var(--color-primary, #5b9fd4);
  color: #fff;
}
.md-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover, #4a8dc2);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(27, 58, 110, 0.1));
}

.md-btn--secondary {
  background: var(--color-secondary, #62beb0);
  color: #fff;
}
.md-btn--secondary:hover:not(:disabled) {
  background: var(--color-secondary-hover, #4eaa9c);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(27, 58, 110, 0.1));
}

.md-btn--outline {
  background: transparent;
  color: var(--color-primary, #5b9fd4);
  border: 1.5px solid var(--color-primary, #5b9fd4);
}
.md-btn--outline:hover:not(:disabled) {
  background: var(--color-primary-subtle, #ebf5fb);
}

.md-btn--ghost {
  background: transparent;
  color: var(--color-primary, #5b9fd4);
}
.md-btn--ghost:hover:not(:disabled) {
  background: var(--color-primary-subtle, #ebf5fb);
}

.md-btn--danger {
  background: var(--error, #e05252);
  color: #fff;
}
.md-btn--danger:hover:not(:disabled) {
  background: var(--error-dark, #b83333);
}

/* Icon variant uses subtle bg */
.md-btn--icon.md-btn--primary {
  background: var(--color-primary-subtle, #ebf5fb);
  color: var(--color-primary, #5b9fd4);
}
.md-btn--icon.md-btn--primary:hover:not(:disabled) {
  background: var(--blue-100, #d4e9f7);
  transform: none;
  box-shadow: none;
}

/* Disabled */
.md-btn--disabled,
.md-btn:disabled {
  background: var(--color-disabled-bg, #ebf0f7) !important;
  color: var(--color-disabled-text, #8baec8) !important;
  border-color: transparent !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Press state */
.md-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* Loading state */
.md-btn[disabled].md-btn--primary,
.md-btn[disabled].md-btn--secondary,
.md-btn[disabled].md-btn--danger {
  opacity: 0.7;
}
</style>
