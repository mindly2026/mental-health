<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseCard } from '@mental-health/design-system'
import { postOAuthCallback } from '../services/api'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { setAuth } = useAuth()
const error = ref<string | null>(null)

onMounted(async () => {
  const provider = route.params['provider'] as string

  // Try query params first, then hash fragment (Apple uses fragment)
  let code = route.query['code'] as string | undefined
  let state = route.query['state'] as string | undefined

  if (!code && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    code = hashParams.get('code') ?? undefined
    state = hashParams.get('state') ?? undefined
  }

  if (!code || !state) {
    error.value = 'Missing authorization code or state parameter.'
    return
  }

  try {
    const result = await postOAuthCallback(provider, { code, state })
    setAuth(result.token, result.user)
    await router.replace('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Authentication failed.'
  }
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Signing in..." class="w-full max-w-sm">
      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>
      <div v-else class="text-sm text-muted-foreground">
        Processing your sign-in, please wait...
      </div>
    </BaseCard>
  </main>
</template>
