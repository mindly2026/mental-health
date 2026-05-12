<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard } from '@mental-health/design-system'
import { postRegister } from '../services/api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { setAuth } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSignup() {
  loading.value = true
  error.value = null
  try {
    const result = await postRegister(email.value, password.value, name.value)
    setAuth(result.token, result.user)
    await router.replace('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Create an account" class="w-full max-w-sm">
      <form class="flex flex-col gap-3" @submit.prevent="handleSignup">
        <p class="text-muted-foreground text-sm">Fill in your details to create an account.</p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="name"
          type="text"
          placeholder="Name"
          required
          class="border rounded px-3 py-2 text-sm"
        />

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

        <BaseButton type="submit" :loading="loading" :disabled="loading"> Sign up </BaseButton>

        <p class="text-sm text-center text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-primary underline">Sign in</router-link>
        </p>
      </form>
    </BaseCard>
  </main>
</template>
