<script setup lang="ts">
interface Props {
  greeting?: string
  subtitle?: string
  avatarInitials?: string
}

defineProps<Props>()

defineEmits<{ 'avatar-click': [] }>()
</script>

<template>
  <header class="md-top-bar" v-bind="$attrs">
    <div class="md-top-bar__text">
      <div v-if="greeting" class="md-top-bar__greeting">{{ greeting }}</div>
      <div v-if="subtitle" class="md-top-bar__subtitle">{{ subtitle }}</div>
      <slot v-if="!greeting && !subtitle" />
    </div>
    <div class="md-top-bar__actions">
      <slot name="actions">
        <button
          v-if="avatarInitials"
          class="md-top-bar__avatar"
          type="button"
          @click="$emit('avatar-click')"
        >
          {{ avatarInitials }}
        </button>
      </slot>
    </div>
  </header>
</template>

<style scoped>
.md-top-bar {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 16px);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm, 0 1px 6px rgba(27, 58, 110, 0.07));
}

.md-top-bar__greeting {
  font-family: var(--font-heading, 'Nunito', system-ui, sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary, #1b3a6e);
}

.md-top-bar__subtitle {
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 13px;
  color: var(--color-text-muted, #8baec8);
  margin-top: 2px;
}

.md-top-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
}

.md-top-bar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--blue-100, #d4e9f7);
  color: var(--blue-700, #2c5b8c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading, 'Nunito', system-ui, sans-serif);
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background var(--duration-fast, 200ms);
  flex-shrink: 0;
}

.md-top-bar__avatar:hover {
  background: var(--blue-200, #a8d4e8);
}
</style>
