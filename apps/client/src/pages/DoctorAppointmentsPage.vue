<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { AppointmentWithDetails } from '@mental-health/contract'
import { getDoctorAppointments, updateAppointmentStatus } from '../services/api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state } = useAuth()

const appointments = ref<AppointmentWithDetails[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedClinic = computed(() => state.selectedClinicId ?? undefined)

onMounted(async () => {
  try {
    appointments.value = await getDoctorAppointments(selectedClinic.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load appointments'
  } finally {
    loading.value = false
  }
})

async function handleStatus(id: string, status: 'confirmed' | 'cancelled') {
  try {
    const updated = await updateAppointmentStatus(id, status)
    const idx = appointments.value.findIndex((a) => a.id === id)
    if (idx !== -1) appointments.value[idx] = { ...appointments.value[idx]!, ...updated }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update status'
  }
}

function statusColor(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-600'
  return 'bg-yellow-100 text-yellow-700'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const upcomingAppointments = computed(() =>
  appointments.value.filter((a) => a.status !== 'cancelled'),
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b px-4 py-3 flex items-center gap-3">
      <button class="text-gray-500 hover:text-gray-800 transition-colors" @click="router.push('/')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-800">My Appointments</h1>
    </header>

    <div class="max-w-2xl mx-auto p-4 flex flex-col gap-3">
      <div v-if="loading" class="text-gray-400 text-sm text-center py-8">Loading…</div>
      <div v-else-if="error" class="text-red-600 bg-red-50 rounded p-3 text-sm">{{ error }}</div>

      <template v-else>
        <div
          v-if="upcomingAppointments.length === 0"
          class="text-center text-gray-400 text-sm py-10"
        >
          No appointments yet.
        </div>

        <div
          v-for="appt in upcomingAppointments"
          :key="appt.id"
          class="bg-white rounded-xl border p-4 flex flex-col gap-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium text-gray-800">{{ appt.customerName ?? 'Patient' }}</p>
              <p class="text-sm text-gray-500">
                {{ formatDate(appt.date) }} · {{ appt.startTime }} – {{ appt.endTime }}
              </p>
              <p v-if="appt.clinicName" class="text-xs text-gray-400 mt-0.5">
                {{ appt.clinicName }}
              </p>
              <p v-if="appt.departmentName" class="text-xs text-gray-400">
                {{ appt.departmentName }}
              </p>
            </div>
            <span
              :class="[
                'text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0',
                statusColor(appt.status),
              ]"
            >
              {{ appt.status }}
            </span>
          </div>

          <p v-if="appt.notes" class="text-sm text-gray-500 bg-gray-50 rounded p-2 text-xs">
            {{ appt.notes }}
          </p>

          <div v-if="appt.status === 'pending'" class="flex gap-2 pt-1">
            <button
              class="flex-1 text-xs bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition-colors"
              @click="handleStatus(appt.id, 'confirmed')"
            >
              Confirm
            </button>
            <button
              class="flex-1 text-xs bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
              @click="handleStatus(appt.id, 'cancelled')"
            >
              Cancel
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
