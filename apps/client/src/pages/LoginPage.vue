<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseCard } from '@mental-health/design-system'
import { checkEmail, postLogin } from '../services/api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { setAuth } = useAuth()

// Two-step flow: first check email, then enter password
type Step = 'email' | 'password'
const step = ref<Step>('email')

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleEmailContinue() {
  if (!email.value) return
  loading.value = true
  error.value = null
  try {
    const result = await checkEmail(email.value)
    if (result.status === 'not_found') {
      error.value = 'No account found with this email. Ask your clinic to invite you, or sign up.'
    } else if (result.status === 'pending_invite') {
      await router.push({ name: 'setup-account', query: { email: email.value } })
    } else {
      // active — show password step
      step.value = 'password'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}

function goBackToEmail() {
  step.value = 'email'
  error.value = null
}

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const result = await postLogin(email.value, password.value)
    setAuth(result.token, result.user, result.clinics)

    // Doctor/staff with multiple clinics need to pick one first
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
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4">
    <BaseCard title="Sign in to Mindly" class="w-full max-w-sm">
      <!-- Step 1: Email -->
      <form
        v-if="step === 'email'"
        class="flex flex-col gap-3"
        @submit.prevent="handleEmailContinue"
      >
        <p class="text-muted-foreground text-sm">Enter your email to continue.</p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
          autofocus
          class="border rounded px-3 py-2 text-sm"
        />

        <BaseButton type="submit" :loading="loading" :disabled="loading">Continue</BaseButton>

        <p class="text-sm text-center text-muted-foreground">
          Don't have an account?
          <router-link to="/signup" class="text-primary underline">Sign up</router-link>
        </p>
      </form>

      <!-- Step 2: Password -->
      <form v-else class="flex flex-col gap-3" @submit.prevent="handleLogin">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            class="hover:text-gray-800 transition-colors"
            @click="goBackToEmail"
          >
            ← Back
          </button>
          <span class="truncate font-medium text-gray-800">{{ email }}</span>
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          autofocus
          class="border rounded px-3 py-2 text-sm"
        />

        <BaseButton type="submit" :loading="loading" :disabled="loading">Sign in</BaseButton>
      </form>
    </BaseCard>
  </main>
</template>
