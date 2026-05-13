<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseButton, BaseCard } from '@mental-health/design-system'
import { setupAccount } from '../services/api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { setAuth } = useAuth()

const email = ref((route.query['email'] as string) ?? '')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(() => {
  if (!email.value) {
    void router.replace({ name: 'login' })
  }
})

async function handleSetup() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true
  error.value = null
  try {
    const result = await setupAccount(email.value, password.value, name.value || undefined)
    setAuth(result.token, result.user, result.clinics)

    if (
      (result.user.role === 'doctor' || result.user.role === 'staff') &&
      result.clinics &&
      result.clinics.length > 1
    ) {
      await router.replace({ name: 'select-clinic' })
    } else {
      await router.replace('/')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Account setup failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Set up your account" class="w-full max-w-sm">
      <form class="flex flex-col gap-3" @submit.prevent="handleSetup">
        <p class="text-muted-foreground text-sm">
          You've been invited to join a clinic. Set a password to activate your account.
        </p>

        <div class="text-sm font-medium text-gray-700 bg-gray-50 rounded px-3 py-2">
          {{ email }}
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="name"
          type="text"
          placeholder="Your full name (optional)"
          class="border rounded px-3 py-2 text-sm"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password (min 8 characters)"
          required
          class="border rounded px-3 py-2 text-sm"
        />

        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm password"
          required
          class="border rounded px-3 py-2 text-sm"
        />

        <BaseButton type="submit" :loading="loading" :disabled="loading">
          Activate account
        </BaseButton>
      </form>
    </BaseCard>
  </main>
</template>
