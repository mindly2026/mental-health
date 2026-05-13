<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MdAvatar } from '@mental-health/design-system'
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
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-800">Mindly</h1>
      <button
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        @click="handleLogout"
      >
        Sign out
      </button>
    </header>

    <div class="max-w-md mx-auto p-4 flex flex-col gap-4 pt-6">
      <!-- User card -->
      <div class="bg-white rounded-xl border p-4 flex items-center gap-3">
        <MdAvatar
          v-bind="state.user?.avatarUrl ? { src: state.user.avatarUrl } : {}"
          :initials="state.user ? getInitials(state.user.name) : '?'"
          size="lg"
        />
        <div>
          <p class="font-semibold text-gray-800">{{ state.user?.name }}</p>
          <p class="text-sm text-gray-500">{{ state.user?.email }}</p>
          <span
            :class="[
              'text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block capitalize',
              state.user?.role === 'clinic'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700',
            ]"
          >
            {{ state.user?.role === 'clinic' ? 'Clinic / Provider' : 'Patient / Customer' }}
          </span>
        </div>
      </div>

      <!-- Customer actions -->
      <template v-if="state.user?.role === 'customer'">
        <router-link
          to="/calendar"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">My Calendar</p>
            <p class="text-sm text-gray-500">View your upcoming appointments</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 ml-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>

        <router-link
          to="/clinics"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div
            class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0"
          >
            <svg
              class="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Find a Clinic</p>
            <p class="text-sm text-gray-500">Browse and book appointments</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 ml-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>
      </template>

      <!-- Clinic actions -->
      <template v-else>
        <router-link
          to="/calendar"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Appointments Calendar</p>
            <p class="text-sm text-gray-500">View all patient appointments</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 ml-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>

        <router-link
          to="/availability"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div
            class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0"
          >
            <svg
              class="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Manage Availability</p>
            <p class="text-sm text-gray-500">Set your weekly schedule</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 ml-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </router-link>
      </template>
    </div>
  </div>
</template>
