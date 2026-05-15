<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ClinicAvailability, DoctorAvailability } from '@mental-health/contract'
import { useAuth } from '../composables/useAuth'
import {
  getClinicAvailability,
  getDoctorAvailability,
  setDoctorAvailability,
} from '../services/api'

const router = useRouter()
const { state } = useAuth()

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

const selectedClinicId = ref<string | null>(null)
const clinicAvailabilityMap = ref<Record<number, { startTime: string; endTime: string }[]>>({})

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface SlotRow {
  startTime: string
  endTime: string
}

const slots = ref<Record<number, SlotRow[]>>(
  Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, []])),
)

function addSlot(dow: number) {
  slots.value[dow] = [...(slots.value[dow] ?? []), { startTime: '09:00', endTime: '17:00' }]
}

function removeSlot(dow: number, idx: number) {
  slots.value[dow] = (slots.value[dow] ?? []).filter((_, i) => i !== idx)
}

function loadDoctorSlots(avail: DoctorAvailability[]) {
  const grouped: Record<number, SlotRow[]> = Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [i, []]),
  )
  for (const a of avail) {
    ;(grouped[a.dayOfWeek] ??= []).push({ startTime: a.startTime, endTime: a.endTime })
  }
  slots.value = grouped
}

function clinicHintForDay(dow: number): string {
  const windows = clinicAvailabilityMap.value[dow] ?? []
  if (windows.length === 0) return 'Clinic closed'
  return 'Clinic open ' + windows.map((w) => `${w.startTime}–${w.endTime}`).join(', ')
}

async function selectClinic(clinicId: string) {
  selectedClinicId.value = clinicId
  error.value = null
  slots.value = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, []]))
  clinicAvailabilityMap.value = {}

  const [clinicAvail, doctorAvail] = await Promise.all([
    getClinicAvailability(clinicId),
    getDoctorAvailability(clinicId),
  ])

  const map: Record<number, { startTime: string; endTime: string }[]> = {}
  for (const w of clinicAvail as ClinicAvailability[]) {
    ;(map[w.dayOfWeek] ??= []).push({ startTime: w.startTime, endTime: w.endTime })
  }
  clinicAvailabilityMap.value = map

  loadDoctorSlots(doctorAvail)
}

async function handleSave() {
  if (!selectedClinicId.value) return
  saving.value = true
  saved.value = false
  error.value = null
  try {
    const allSlots = Object.entries(slots.value).flatMap(([dow, rows]) =>
      (rows as SlotRow[]).map((r) => ({
        dayOfWeek: Number(dow),
        startTime: r.startTime,
        endTime: r.endTime,
      })),
    )
    await setDoctorAvailability(selectedClinicId.value, { slots: allSlots })
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save availability'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    // Default to selectedClinicId from auth state, or first clinic
    const defaultClinicId =
      state.selectedClinicId ??
      (state.clinics.length > 0 ? (state.clinics[0]?.clinicId ?? null) : null)
    if (defaultClinicId) {
      await selectClinic(defaultClinicId)
    }
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
      <h1 class="text-lg font-semibold">My Availability</h1>
      <button
        v-if="selectedClinicId"
        :disabled="saving"
        class="ml-auto px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes' }}
      </button>
    </header>

    <div v-if="loading" class="flex justify-center py-16 text-gray-400">Loading...</div>

    <div v-else class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <!-- Clinic selector (shown when doctor belongs to multiple clinics) -->
      <div v-if="state.clinics.length > 1" class="bg-white rounded-xl border p-4">
        <h3 class="font-medium text-gray-700 text-sm mb-2">Select Clinic</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="clinic in state.clinics"
            :key="clinic.clinicId"
            :class="[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              selectedClinicId === clinic.clinicId
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            ]"
            @click="selectClinic(clinic.clinicId)"
          >
            {{ clinic.clinicName }}
          </button>
        </div>
      </div>

      <div v-if="!selectedClinicId" class="text-center py-8 text-gray-400">
        No clinic found. Make sure you are an active member of a clinic.
      </div>

      <template v-else>
        <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded p-3">{{ error }}</div>
        <div v-if="saved" class="text-sm text-green-700 bg-green-50 rounded p-3">
          Availability saved successfully.
        </div>

        <p class="text-sm text-gray-500 px-1">
          Set your personal hours for each day. Slots must be within your clinic's open hours.
        </p>

        <div v-for="dow in [1, 2, 3, 4, 5, 6, 0]" :key="dow" class="bg-white rounded-xl border">
          <div class="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <span class="font-medium text-gray-700">{{ DAY_NAMES[dow] }}</span>
              <span class="ml-2 text-xs text-gray-400">{{ clinicHintForDay(dow) }}</span>
            </div>
            <button
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              @click="addSlot(dow)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add slot
            </button>
          </div>

          <div v-if="(slots[dow] ?? []).length === 0" class="px-4 py-3 text-sm text-gray-400">
            Unavailable
          </div>

          <div v-else class="px-4 py-2 flex flex-col gap-2">
            <div v-for="(slot, idx) in slots[dow]" :key="idx" class="flex items-center gap-2">
              <input
                v-model="slot.startTime"
                type="time"
                class="border rounded px-2 py-1.5 text-sm"
              />
              <span class="text-gray-400 text-sm">to</span>
              <input
                v-model="slot.endTime"
                type="time"
                class="border rounded px-2 py-1.5 text-sm"
              />
              <button
                class="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                @click="removeSlot(dow, idx)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button
          :disabled="saving"
          class="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          @click="handleSave"
        >
          {{ saving ? 'Saving...' : saved ? 'Saved!' : 'Save Availability' }}
        </button>
      </template>
    </div>
  </div>
</template>
