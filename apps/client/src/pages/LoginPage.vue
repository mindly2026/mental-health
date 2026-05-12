<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard } from '@mental-health/design-system'
import { getOAuthAuthorizeUrl } from '../services/api'

const loading = ref<string | null>(null)
const error = ref<string | null>(null)

async function loginWith(provider: 'google' | 'apple' | 'facebook') {
  loading.value = provider
  error.value = null
  try {
    const { url } = await getOAuthAuthorizeUrl(provider)
    window.location.href = url
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to start login'
    loading.value = null
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Sign in to Mindly" class="w-full max-w-sm">
      <div class="flex flex-col gap-3">
        <p class="text-muted-foreground text-sm">
          Choose a provider to sign in or create an account.
        </p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <BaseButton
          variant="outline"
          :loading="loading === 'google'"
          :disabled="loading !== null"
          @click="loginWith('google')"
        >
          Continue with Google
        </BaseButton>

        <BaseButton
          variant="outline"
          :loading="loading === 'apple'"
          :disabled="loading !== null"
          @click="loginWith('apple')"
        >
          Continue with Apple
        </BaseButton>

        <BaseButton
          variant="outline"
          :loading="loading === 'facebook'"
          :disabled="loading !== null"
          @click="loginWith('facebook')"
        >
          Continue with Facebook
        </BaseButton>
      </div>
    </BaseCard>
  </main>
</template>
