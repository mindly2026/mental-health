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
const role = ref<'customer' | 'clinic'>('customer')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSignup() {
  loading.value = true
  error.value = null
  try {
    const result = await postRegister(email.value, password.value, name.value, role.value)
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
  <main class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <BaseCard title="Create an account" class="w-full max-w-sm">
      <form class="flex flex-col gap-4" @submit.prevent="handleSignup">
        <p class="text-muted-foreground text-sm">Fill in your details to get started.</p>

        <!-- Role selector -->
        <div class="flex rounded-lg border overflow-hidden">
          <button
            type="button"
            :class="[
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              role === 'customer'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-muted-foreground hover:bg-gray-50',
            ]"
            @click="role = 'customer'"
          >
            Patient / Customer
          </button>
          <button
            type="button"
            :class="[
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              role === 'clinic'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-muted-foreground hover:bg-gray-50',
            ]"
            @click="role = 'clinic'"
          >
            Clinic / Provider
          </button>
        </div>

        <p v-if="role === 'customer'" class="text-xs text-muted-foreground -mt-1">
          Book appointments at mental health clinics.
        </p>
        <p v-else class="text-xs text-muted-foreground -mt-1">
          Manage your clinic, set availability, and see patient appointments.
        </p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ error }}
        </div>

        <input
          v-model="name"
          type="text"
          :placeholder="role === 'clinic' ? 'Your name (clinic owner)' : 'Full name'"
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

        <BaseButton type="submit" :loading="loading" :disabled="loading">
          Create {{ role === 'clinic' ? 'Clinic' : 'Customer' }} Account
        </BaseButton>

        <p class="text-sm text-center text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="text-primary underline">Sign in</router-link>
        </p>
      </form>
    </BaseCard>
  </main>
</template>
