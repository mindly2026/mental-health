<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  type?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  type: 'text',
  disabled: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="md-field" v-bind="$attrs">
    <label v-if="label" class="md-field__label">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['md-input', { 'md-input--error': error, 'md-input--disabled': disabled }]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="md-field__error">{{ error }}</p>
    <p v-else-if="hint" class="md-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.md-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.md-field__label {
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #1b3a6e);
}

.md-field__hint {
  font-size: 11px;
  color: var(--color-text-muted, #8baec8);
}

.md-field__error {
  font-size: 11px;
  color: var(--error, #e05252);
}

.md-input {
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 15px;
  padding: 12px 14px;
  border-radius: var(--radius-md, 12px);
  border: 1.5px solid var(--color-border, #a8d4e8);
  background: var(--color-surface, #ffffff);
  color: var(--color-text-primary, #1b3a6e);
  outline: none;
  width: 100%;
  transition:
    border-color var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1)),
    box-shadow var(--duration-fast, 200ms) var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}

.md-input::placeholder {
  color: var(--color-text-muted, #8baec8);
}

.md-input:focus {
  border-color: var(--color-border-focus, #5b9fd4);
  box-shadow: 0 0 0 3px rgba(91, 159, 212, 0.15);
}

.md-input--error {
  border-color: var(--error, #e05252);
}
.md-input--error:focus {
  box-shadow: 0 0 0 3px rgba(224, 82, 82, 0.12);
}

.md-input--disabled,
.md-input:disabled {
  background: var(--color-disabled-bg, #ebf0f7);
  color: var(--color-disabled-text, #8baec8);
  cursor: not-allowed;
}
</style>
