<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state, selectClinic } = useAuth()

const clinics = computed(() => state.clinics)

function handleSelect(clinicId: string) {
  selectClinic(clinicId)
  void router.replace('/')
}

const roleLabel = computed(() => {
  if (state.user?.role === 'doctor') return 'doctor'
  return 'staff member'
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-sm flex flex-col gap-4">
      <div class="text-center">
        <h1 class="text-xl font-semibold text-gray-800">Select a clinic</h1>
        <p class="text-sm text-gray-500 mt-1">
          You are a {{ roleLabel }} at multiple clinics. Which one are you working in today?
        </p>
      </div>

      <div
        v-for="clinic in clinics"
        :key="clinic.clinicId"
        class="bg-white rounded-xl border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
        @click="handleSelect(clinic.clinicId)"
      >
        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <svg
            class="w-5 h-5 text-indigo-600"
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
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-800 truncate">{{ clinic.clinicName }}</p>
          <p v-if="clinic.departmentName" class="text-xs text-gray-400 truncate">
            {{ clinic.departmentName }}
          </p>
        </div>
        <svg
          class="w-4 h-4 text-gray-300 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </main>
</template>
