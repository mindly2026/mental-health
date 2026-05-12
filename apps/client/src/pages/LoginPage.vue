<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard } from '@mental-health/design-system'
import { postLogin } from '../services/api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { setAuth } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const result = await postLogin(email.value, password.value)
    setAuth(result.token, result.user)
    await router.replace('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Sign in to Mindly" class="w-full max-w-sm">
      <form class="flex flex-col gap-3" @submit.prevent="handleLogin">
        <p class="text-muted-foreground text-sm">Enter your email and password to sign in.</p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          class="border rounded px-3 py-2 text-sm"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="border rounded px-3 py-2 text-sm"
        />

        <BaseButton type="submit" :loading="loading" :disabled="loading"> Sign in </BaseButton>

        <p class="text-sm text-center text-muted-foreground">
          Don't have an account?
          <router-link to="/signup" class="text-primary underline">Sign up</router-link>
        </p>
      </form>
    </BaseCard>
  </main>
</template>
