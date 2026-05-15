<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { AppointmentWithDetails } from '@mental-health/contract'
import { useAuth } from '../composables/useAuth'
import { getMyAppointments, getClinicAppointments, getMyClinic } from '../services/api'

const router = useRouter()
const { state } = useAuth()

type View = 'month' | 'week' | 'day'

const view = ref<View>('week')
const currentDate = ref(new Date())
const appointments = ref<AppointmentWithDetails[]>([])
const clinicId = ref<string | null>(null)
const loading = ref(true)
const selectedAppt = ref<AppointmentWithDetails | null>(null)

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// --- Date helpers ---
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function isToday(date: Date): boolean {
  return toDateStr(date) === toDateStr(new Date())
}

function isSameMonth(date: Date, ref: Date): boolean {
  return date.getMonth() === ref.getMonth() && date.getFullYear() === ref.getFullYear()
}

// --- Computed header label ---
const headerLabel = computed(() => {
  if (view.value === 'month') {
    return `${MONTH_NAMES[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
  }
  if (view.value === 'week') {
    const start = startOfWeek(currentDate.value)
    const end = addDays(start, 6)
    if (start.getMonth() === end.getMonth()) {
      return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`
    }
    return `${MONTH_NAMES[start.getMonth()]} – ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`
  }
  return `${DAY_NAMES_FULL[currentDate.value.getDay()]}, ${MONTH_NAMES[currentDate.value.getMonth()]} ${currentDate.value.getDate()}`
})

// --- Week view: 7 days ---
const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
})

// --- Month view: 6 rows × 7 cols ---
const monthGrid = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDay = addDays(firstDay, -firstDay.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(startDay, i))
})

// --- Navigation ---
function navigate(dir: -1 | 1) {
  const d = new Date(currentDate.value)
  if (view.value === 'month') {
    d.setMonth(d.getMonth() + dir)
  } else if (view.value === 'week') {
    d.setDate(d.getDate() + dir * 7)
  } else {
    d.setDate(d.getDate() + dir)
  }
  currentDate.value = d
}

function goToday() {
  currentDate.value = new Date()
}

// --- Appointments helpers ---
function apptsByDate(dateStr: string) {
  return appointments.value.filter((a) => a.date === dateStr)
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function apptStyle(appt: AppointmentWithDetails): Record<string, string> {
  const startMin = timeToMinutes(appt.startTime)
  const endMin = timeToMinutes(appt.endTime)
  const top = (startMin / 60) * 64 // 64px per hour
  const height = Math.max(((endMin - startMin) / 60) * 64, 24)
  return {
    top: `${top}px`,
    height: `${height}px`,
    left: '2px',
    right: '2px',
    position: 'absolute',
  }
}

function statusColor(status: string): string {
  if (status === 'confirmed') return 'bg-green-500 text-white'
  if (status === 'cancelled') return 'bg-red-400 text-white line-through'
  return 'bg-blue-500 text-white'
}

function statusBadgeColor(status: string): string {
  if (status === 'confirmed') return 'bg-green-100 text-green-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-blue-100 text-blue-700'
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  if (h === undefined || m === undefined) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

// --- Load data ---
onMounted(async () => {
  try {
    if (state.user?.role === 'clinic') {
      const clinic = await getMyClinic()
      clinicId.value = clinic.id
      appointments.value = await getClinicAppointments(clinic.id)
    } else {
      appointments.value = await getMyAppointments()
    }
  } catch {
    // no appointments yet
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col h-screen bg-white">
    <!-- Top bar -->
    <header class="flex items-center gap-3 px-4 py-3 border-b shrink-0">
      <button
        class="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
        @click="() => router.push('/')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <span class="text-xl font-semibold text-gray-800 min-w-[200px]">{{ headerLabel }}</span>

      <div class="flex items-center gap-1 ml-auto">
        <button
          class="px-3 py-1.5 text-sm rounded border hover:bg-gray-50 transition-colors"
          @click="goToday"
        >
          Today
        </button>
        <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" @click="navigate(-1)">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button class="p-1.5 rounded hover:bg-gray-100 transition-colors" @click="navigate(1)">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- View toggle -->
      <div class="flex rounded-lg border overflow-hidden text-sm ml-2">
        <button
          v-for="v in ['month', 'week', 'day'] as View[]"
          :key="v"
          :class="[
            'px-3 py-1.5 capitalize transition-colors',
            view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-50 text-gray-600',
          ]"
          @click="view = v"
        >
          {{ v }}
        </button>
      </div>

      <!-- Quick action -->
      <router-link
        v-if="state.user?.role === 'customer'"
        to="/clinics"
        class="ml-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Book Appointment
      </router-link>
      <router-link
        v-else
        to="/availability"
        class="ml-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Manage Availability
      </router-link>
    </header>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      Loading...
    </div>

    <!-- MONTH VIEW -->
    <div v-else-if="view === 'month'" class="flex-1 overflow-auto">
      <!-- Day name headers -->
      <div class="grid grid-cols-7 border-b">
        <div
          v-for="day in DAY_NAMES"
          :key="day"
          class="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          {{ day }}
        </div>
      </div>
      <!-- Month grid -->
      <div class="grid grid-cols-7" style="grid-auto-rows: minmax(120px, 1fr)">
        <div
          v-for="(day, idx) in monthGrid"
          :key="idx"
          :class="[
            'border-b border-r p-1 min-h-[120px]',
            !isSameMonth(day, currentDate) ? 'bg-gray-50' : 'bg-white',
          ]"
        >
          <div
            :class="[
              'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mx-auto mb-1',
              isToday(day)
                ? 'bg-blue-600 text-white'
                : isSameMonth(day, currentDate)
                  ? 'text-gray-800'
                  : 'text-gray-400',
            ]"
          >
            {{ day.getDate() }}
          </div>
          <div class="flex flex-col gap-0.5">
            <div
              v-for="appt in apptsByDate(toDateStr(day))"
              :key="appt.id"
              :class="[
                'text-xs px-1 py-0.5 rounded truncate cursor-pointer',
                statusColor(appt.status),
              ]"
              @click="selectedAppt = appt"
            >
              {{ formatTime(appt.startTime) }}
              {{ appt.clinicName ?? appt.customerName ?? 'Appointment' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WEEK VIEW -->
    <div v-else-if="view === 'week'" class="flex-1 flex flex-col overflow-hidden">
      <!-- Day column headers -->
      <div class="flex border-b shrink-0">
        <div class="w-16 shrink-0" />
        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="flex-1 py-2 text-center border-l"
        >
          <div class="text-xs text-gray-500 uppercase">{{ DAY_NAMES[day.getDay()] }}</div>
          <div
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold mx-auto mt-0.5',
              isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-800',
            ]"
          >
            {{ day.getDate() }}
          </div>
        </div>
      </div>

      <!-- Scrollable time grid -->
      <div class="flex-1 overflow-y-auto">
        <div class="flex" style="min-height: 1536px">
          <!-- Time gutter -->
          <div class="w-16 shrink-0 relative">
            <div
              v-for="hour in HOURS"
              :key="hour"
              class="absolute right-2 text-xs text-gray-400 -translate-y-2"
              :style="{ top: `${hour * 64}px` }"
            >
              {{ formatHour(hour) }}
            </div>
          </div>

          <!-- Day columns -->
          <div v-for="day in weekDays" :key="day.toISOString()" class="flex-1 border-l relative">
            <!-- Hour lines -->
            <div
              v-for="hour in HOURS"
              :key="hour"
              class="border-t border-gray-100"
              :style="{ height: '64px' }"
            />
            <!-- Appointments -->
            <div
              v-for="appt in apptsByDate(toDateStr(day))"
              :key="appt.id"
              :class="[
                'rounded text-xs p-1 cursor-pointer overflow-hidden leading-tight z-10',
                statusColor(appt.status),
              ]"
              :style="apptStyle(appt)"
              @click="selectedAppt = appt"
            >
              <div class="font-medium truncate">
                {{ appt.clinicName ?? appt.customerName ?? 'Appointment' }}
              </div>
              <div class="opacity-90">
                {{ formatTime(appt.startTime) }}–{{ formatTime(appt.endTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DAY VIEW -->
    <div v-else class="flex-1 flex flex-col overflow-hidden">
      <div class="flex border-b shrink-0 px-4 py-2">
        <div class="text-center">
          <div class="text-xs text-gray-500 uppercase">{{ DAY_NAMES[currentDate.getDay()] }}</div>
          <div
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold mx-auto',
              isToday(currentDate) ? 'bg-blue-600 text-white' : 'text-gray-800',
            ]"
          >
            {{ currentDate.getDate() }}
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="flex" style="min-height: 1536px">
          <!-- Time gutter -->
          <div class="w-16 shrink-0 relative">
            <div
              v-for="hour in HOURS"
              :key="hour"
              class="absolute right-2 text-xs text-gray-400 -translate-y-2"
              :style="{ top: `${hour * 64}px` }"
            >
              {{ formatHour(hour) }}
            </div>
          </div>
          <!-- Day column -->
          <div class="flex-1 border-l relative">
            <div
              v-for="hour in HOURS"
              :key="hour"
              class="border-t border-gray-100"
              style="height: 64px"
            />
            <div
              v-for="appt in apptsByDate(toDateStr(currentDate))"
              :key="appt.id"
              :class="[
                'rounded text-xs p-1.5 cursor-pointer overflow-hidden leading-tight z-10',
                statusColor(appt.status),
              ]"
              :style="apptStyle(appt)"
              @click="selectedAppt = appt"
            >
              <div class="font-medium truncate">
                {{ appt.clinicName ?? appt.customerName ?? 'Appointment' }}
              </div>
              <div class="opacity-90">
                {{ formatTime(appt.startTime) }}–{{ formatTime(appt.endTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && appointments.length === 0"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-32"
    >
      <svg
        class="w-16 h-16 text-gray-200 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p class="text-gray-400 text-sm">No appointments yet</p>
      <router-link
        v-if="state.user?.role === 'customer'"
        to="/clinics"
        class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg pointer-events-auto"
      >
        Browse Clinics
      </router-link>
    </div>

    <!-- Appointment detail modal -->
    <Teleport to="body">
      <div
        v-if="selectedAppt"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        @click.self="selectedAppt = null"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
          <div class="flex items-start justify-between mb-4">
            <h3 class="font-semibold text-gray-800 text-lg">Appointment Details</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="selectedAppt = null">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  statusBadgeColor(selectedAppt.status),
                ]"
              >
                {{ selectedAppt.status }}
              </span>
            </div>
            <div v-if="selectedAppt.clinicName">
              <span class="text-gray-500">Clinic:</span>
              <span class="ml-2 font-medium">{{ selectedAppt.clinicName }}</span>
            </div>
            <div v-if="selectedAppt.customerName">
              <span class="text-gray-500">Patient:</span>
              <span class="ml-2 font-medium">{{ selectedAppt.customerName }}</span>
            </div>
            <div v-if="selectedAppt.doctorName">
              <span class="text-gray-500">Doctor:</span>
              <span class="ml-2 font-medium">{{ selectedAppt.doctorName }}</span>
            </div>
            <div v-if="selectedAppt.departmentName">
              <span class="text-gray-500">Department:</span>
              <span class="ml-2 font-medium">{{ selectedAppt.departmentName }}</span>
            </div>
            <div>
              <span class="text-gray-500">Date:</span>
              <span class="ml-2 font-medium">{{ selectedAppt.date }}</span>
            </div>
            <div>
              <span class="text-gray-500">Time:</span>
              <span class="ml-2 font-medium">
                {{ formatTime(selectedAppt.startTime) }} – {{ formatTime(selectedAppt.endTime) }}
              </span>
            </div>
            <div v-if="selectedAppt.notes">
              <span class="text-gray-500">Notes:</span>
              <span class="ml-2">{{ selectedAppt.notes }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
