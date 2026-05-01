<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <div class="md-toggle-row" v-bind="$attrs">
    <label class="md-toggle" :class="{ 'md-toggle--disabled': disabled }">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="md-toggle__slider" />
    </label>
    <span v-if="label" class="md-toggle__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.md-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.md-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.md-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.md-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.md-toggle__slider {
  position: absolute;
  inset: 0;
  background: var(--neutral-300, #b8ccde);
  border-radius: 9999px;
  transition: background var(--duration-fast, 200ms)
    var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}

.md-toggle__slider::before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform var(--duration-fast, 200ms)
    var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(27, 58, 110, 0.05));
}

.md-toggle input:checked + .md-toggle__slider {
  background: var(--color-primary, #5b9fd4);
}

.md-toggle input:checked + .md-toggle__slider::before {
  transform: translateX(20px);
}

.md-toggle__label {
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 14px;
  color: var(--color-text-secondary, #456f90);
}
</style>
