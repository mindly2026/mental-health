<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard, MdAvatar } from '@mental-health/design-system'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state, logout } = useAuth()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleLogout() {
  logout()
  void router.replace('/login')
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Dashboard" class="w-full max-w-md">
      <div class="flex flex-col gap-4">
        <div v-if="state.user" class="flex items-center gap-3">
          <MdAvatar
            v-bind="state.user.avatarUrl ? { src: state.user.avatarUrl } : {}"
            :initials="getInitials(state.user.name)"
            size="lg"
          />
          <div>
            <p class="font-medium">{{ state.user.name }}</p>
            <p class="text-sm text-muted-foreground">{{ state.user.email }}</p>
          </div>
        </div>

        <p class="text-muted-foreground text-sm">
          You are signed in. This is a placeholder dashboard.
        </p>

        <BaseButton variant="outline" @click="handleLogout">Sign out</BaseButton>
      </div>
    </BaseCard>
  </main>
</template>
