<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Clinic } from '@mental-health/contract'
import { getClinics } from '../services/api'

const router = useRouter()
const clinics = ref<Clinic[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    clinics.value = await getClinics()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load clinics'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b px-4 py-3 flex items-center gap-3">
      <button class="text-gray-500 hover:text-gray-800 p-1 rounded" @click="router.push('/')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-lg font-semibold">Find a Clinic</h1>
    </header>

    <div class="max-w-2xl mx-auto p-4">
      <div v-if="loading" class="flex justify-center py-16 text-gray-400">Loading clinics...</div>

      <div v-else-if="error" class="text-center py-16 text-red-500">{{ error }}</div>

      <div v-else-if="clinics.length === 0" class="text-center py-16">
        <svg
          class="w-16 h-16 text-gray-200 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p class="text-gray-400">No clinics registered yet.</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="clinic in clinics"
          :key="clinic.id"
          class="bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
          @click="router.push(`/clinics/${clinic.id}`)"
        >
          <div class="flex items-start justify-between">
            <div>
              <h2 class="font-semibold text-gray-800">{{ clinic.name }}</h2>
              <p v-if="clinic.address" class="text-sm text-gray-500 mt-0.5">
                <svg
                  class="w-3.5 h-3.5 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {{ clinic.address }}
              </p>
              <p v-if="clinic.phone" class="text-sm text-gray-500 mt-0.5">
                <svg
                  class="w-3.5 h-3.5 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {{ clinic.phone }}
              </p>
            </div>
            <svg
              class="w-5 h-5 text-gray-300 shrink-0 mt-0.5"
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
          </div>
          <p v-if="clinic.description" class="text-sm text-gray-600 mt-2 line-clamp-2">
            {{ clinic.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
