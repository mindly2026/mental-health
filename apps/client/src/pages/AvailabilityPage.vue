<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Clinic, ClinicAvailability } from '@mental-health/contract'
import {
  getMyClinic,
  createClinic,
  getClinicAvailability,
  setClinicAvailability,
} from '../services/api'

const router = useRouter()

const clinic = ref<Clinic | null>(null)
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

// Clinic creation form
const showCreateForm = ref(false)
const newClinicName = ref('')
const newClinicAddress = ref('')
const newClinicPhone = ref('')
const newClinicDescription = ref('')
const creating = ref(false)

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Slots indexed by dayOfWeek
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

function loadAvailability(avail: ClinicAvailability[]) {
  const grouped: Record<number, SlotRow[]> = Object.fromEntries(
    Array.from({ length: 7 }, (_, i) => [i, []]),
  )
  for (const a of avail) {
    ;(grouped[a.dayOfWeek] ??= []).push({ startTime: a.startTime, endTime: a.endTime })
  }
  slots.value = grouped
}

async function handleCreateClinic() {
  creating.value = true
  error.value = null
  try {
    clinic.value = await createClinic({
      name: newClinicName.value,
      address: newClinicAddress.value || undefined,
      phone: newClinicPhone.value || undefined,
      description: newClinicDescription.value || undefined,
    })
    showCreateForm.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create clinic'
  } finally {
    creating.value = false
  }
}

async function handleSave() {
  if (!clinic.value) return
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
    await setClinicAvailability(clinic.value.id, { slots: allSlots })
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
    clinic.value = await getMyClinic()
    const avail = await getClinicAvailability(clinic.value.id)
    loadAvailability(avail)
  } catch {
    showCreateForm.value = true
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
      <h1 class="text-lg font-semibold">Availability</h1>
      <button
        v-if="clinic && !showCreateForm"
        :disabled="saving"
        class="ml-auto px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes' }}
      </button>
    </header>

    <div v-if="loading" class="flex justify-center py-16 text-gray-400">Loading...</div>

    <!-- Create clinic form -->
    <div v-else-if="showCreateForm" class="max-w-md mx-auto p-4 mt-4">
      <div class="bg-white rounded-xl border p-5">
        <h2 class="font-semibold text-gray-800 mb-1">Set up your clinic profile</h2>
        <p class="text-sm text-gray-500 mb-4">
          Create your clinic profile before setting availability.
        </p>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded p-2 mb-3">{{ error }}</div>

        <div class="flex flex-col gap-3">
          <input
            v-model="newClinicName"
            type="text"
            placeholder="Clinic name *"
            required
            class="border rounded px-3 py-2 text-sm"
          />
          <input
            v-model="newClinicAddress"
            type="text"
            placeholder="Address (optional)"
            class="border rounded px-3 py-2 text-sm"
          />
          <input
            v-model="newClinicPhone"
            type="text"
            placeholder="Phone (optional)"
            class="border rounded px-3 py-2 text-sm"
          />
          <textarea
            v-model="newClinicDescription"
            placeholder="Description (optional)"
            rows="2"
            class="border rounded px-3 py-2 text-sm resize-none"
          />
          <button
            :disabled="creating || !newClinicName"
            class="py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            @click="handleCreateClinic"
          >
            {{ creating ? 'Creating...' : 'Create Clinic Profile' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Availability editor -->
    <div v-else class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <div class="bg-white rounded-xl border p-4">
        <h2 class="font-semibold text-gray-800">{{ clinic?.name }}</h2>
        <p v-if="clinic?.address" class="text-sm text-gray-500 mt-0.5">{{ clinic.address }}</p>
      </div>

      <div v-if="error" class="text-sm text-red-600 bg-red-50 rounded p-3">{{ error }}</div>
      <div v-if="saved" class="text-sm text-green-700 bg-green-50 rounded p-3">
        Availability saved successfully.
      </div>

      <p class="text-sm text-gray-500 px-1">
        Set the hours you're available each day. Customers will be able to book within these times.
      </p>

      <div v-for="dow in [1, 2, 3, 4, 5, 6, 0]" :key="dow" class="bg-white rounded-xl border">
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <span class="font-medium text-gray-700 w-28">{{ DAY_NAMES[dow] }}</span>
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
            <input v-model="slot.endTime" type="time" class="border rounded px-2 py-1.5 text-sm" />
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
    </div>
  </div>
</template>
