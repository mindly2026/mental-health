<script setup lang="ts">
interface Props {
  initials?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: 'blue' | 'teal' | 'navy' | 'blend'
  ring?: boolean
  ringColor?: 'blue' | 'teal'
  status?: 'online' | 'away' | 'offline'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'blue',
  ring: false,
  ringColor: 'blue',
})
</script>

<template>
  <div class="md-av-wrap">
    <div
      :class="[
        'md-av',
        `md-av--${size}`,
        !src ? `md-av--${color}` : 'md-av--img',
        { 'md-av--ring': ring && ringColor === 'blue' },
        { 'md-av--ring-teal': ring && ringColor === 'teal' },
      ]"
      v-bind="$attrs"
    >
      <img v-if="src" :src="src" :alt="initials" />
      <span v-else>{{ initials }}</span>
    </div>
    <span v-if="status" :class="['md-av-status', `md-av-status--${status}`]" />
  </div>
</template>

<style scoped>
.md-av-wrap {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.md-av {
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading, 'Nunito', system-ui, sans-serif);
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.md-av img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
}

/* Sizes */
.md-av--xs {
  width: 24px;
  height: 24px;
  font-size: 9px;
}
.md-av--sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
}
.md-av--md {
  width: 44px;
  height: 44px;
  font-size: 16px;
}
.md-av--lg {
  width: 64px;
  height: 64px;
  font-size: 22px;
}
.md-av--xl {
  width: 80px;
  height: 80px;
  font-size: 28px;
}
.md-av--2xl {
  width: 104px;
  height: 104px;
  font-size: 36px;
}

/* Color variants */
.md-av--blue {
  background: var(--blue-100, #d4e9f7);
  color: var(--blue-700, #2c5b8c);
}
.md-av--teal {
  background: var(--teal-100, #c8ede9);
  color: var(--teal-700, #2e7870);
}
.md-av--navy {
  background: var(--blue-900, #1b3a6e);
  color: #fff;
}
.md-av--blend {
  background: var(--blend-300, #8acdd8);
  color: var(--blue-900, #1b3a6e);
}
.md-av--img {
  background: var(--neutral-200, #d6e2ee);
}

/* Rings */
.md-av--ring {
  box-shadow:
    0 0 0 3px var(--neutral-0, #fff),
    0 0 0 5px var(--color-primary, #5b9fd4);
}
.md-av--ring-teal {
  box-shadow:
    0 0 0 3px var(--neutral-0, #fff),
    0 0 0 5px var(--color-secondary, #62beb0);
}

/* Status dot */
.md-av-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  border: 2px solid var(--neutral-50, #f5f9fd);
}
.md-av-status--online {
  background: var(--success, #2db885);
}
.md-av-status--away {
  background: var(--warning, #f5a623);
}
.md-av-status--offline {
  background: var(--neutral-300, #b8ccde);
}
</style>
