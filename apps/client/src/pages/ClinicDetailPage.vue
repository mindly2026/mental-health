<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type {
  Clinic,
  ClinicAvailability,
  DoctorAvailability,
  Department,
  DoctorPublicInfo,
} from '@mental-health/contract'
import {
  getClinic,
  getClinicAvailability,
  bookAppointment,
  getDepartments,
  getClinicDoctors,
  getDoctorMemberAvailability,
} from '../services/api'

const router = useRouter()
const route = useRoute()
const clinicId = route.params['id'] as string

const clinic = ref<Clinic | null>(null)
const clinicAvailability = ref<ClinicAvailability[]>([])
const availability = ref<ClinicAvailability[] | DoctorAvailability[]>([])
const departments = ref<Department[]>([])
const doctors = ref<DoctorPublicInfo[]>([])
const selectedDepartmentId = ref<string | null>(null)
const selectedDoctorId = ref<string | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)
const departmentSelectionMade = ref(false)
const doctorSelectionMade = ref(false)
const booking = ref(false)
const bookingError = ref<string | null>(null)
const bookingSuccess = ref(false)

const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)
const selectedSlot = ref<{ start: string; end: string } | null>(null)
const notes = ref('')

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function isToday(date: Date): boolean {
  return toDateStr(date) === toDateStr(new Date())
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const headerLabel = computed(
  () => `${MONTH_NAMES[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`,
)

const monthGrid = computed(() => {
  const firstDay = startOfMonth(currentDate.value)
  const startDay = addDays(firstDay, -firstDay.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(startDay, i))
})

function isSameMonth(date: Date): boolean {
  return date.getMonth() === currentDate.value.getMonth()
}

function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function hasAvailability(date: Date): boolean {
  const dow = date.getDay()
  return availability.value.some((s) => s.dayOfWeek === dow)
}

const SLOT_DURATION_MINUTES = 60

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function slotsForDate(date: Date): Array<{ start: string; end: string; label: string }> {
  const dow = date.getDay()
  const slots: Array<{ start: string; end: string; label: string }> = []
  for (const window of availability.value.filter((s) => s.dayOfWeek === dow)) {
    const windowStart = timeToMinutes(window.startTime)
    const windowEnd = timeToMinutes(window.endTime)
    for (let t = windowStart; t + SLOT_DURATION_MINUTES <= windowEnd; t += SLOT_DURATION_MINUTES) {
      const start = minutesToTime(t)
      const end = minutesToTime(t + SLOT_DURATION_MINUTES)
      slots.push({ start, end, label: `${formatTime(start)} – ${formatTime(end)}` })
    }
  }
  return slots
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  if (h === undefined || m === undefined) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function selectDate(date: Date) {
  if (isPast(date) && !isToday(date)) return
  if (!hasAvailability(date)) return
  selectedDate.value = toDateStr(date)
  selectedSlot.value = null
  // If dept/doctor were pre-selected (e.g. via query params), treat those steps as done
  departmentSelectionMade.value = selectedDepartmentId.value !== null
  doctorSelectionMade.value = selectedDoctorId.value !== null
}

const selectedDateSlots = computed(() => {
  if (!selectedDate.value) return []
  const d = new Date(selectedDate.value + 'T00:00:00')
  return slotsForDate(d)
})

const selectedDoctor = computed(
  () => doctors.value.find((d) => d.userId === selectedDoctorId.value) ?? null,
)

const selectedDepartment = computed(
  () => departments.value.find((d) => d.id === selectedDepartmentId.value) ?? null,
)

const showDepartmentStep = computed(
  () => selectedDate.value !== null && departments.value.length > 0,
)

const showDoctorStep = computed(() => {
  if (!selectedDate.value) return false
  if (departments.value.length > 0 && !departmentSelectionMade.value) return false
  return doctors.value.length > 0
})

const showTimeSlots = computed(() => {
  if (!selectedDate.value) return false
  if (showDepartmentStep.value && !departmentSelectionMade.value) return false
  if (showDoctorStep.value && !doctorSelectionMade.value) return false
  return true
})

async function selectDepartment(deptId: string | null) {
  selectedDepartmentId.value = deptId
  departmentSelectionMade.value = true
  selectedDoctorId.value = null
  doctorSelectionMade.value = false
  selectedSlot.value = null
  availability.value = clinicAvailability.value
  doctors.value = []
  try {
    doctors.value = deptId
      ? await getClinicDoctors(clinicId, deptId)
      : await getClinicDoctors(clinicId)
  } catch {
    doctors.value = []
  }
}

async function selectDoctor(doc: DoctorPublicInfo | null) {
  doctorSelectionMade.value = true
  selectedSlot.value = null

  if (doc === null || selectedDoctorId.value === doc.userId) {
    selectedDoctorId.value = null
    availability.value = clinicAvailability.value
    return
  }

  selectedDoctorId.value = doc.userId
  if (doc.departmentId) {
    selectedDepartmentId.value = doc.departmentId
  }

  try {
    const doctorAvail = await getDoctorMemberAvailability(clinicId, doc.memberId)
    availability.value = doctorAvail.length > 0 ? doctorAvail : clinicAvailability.value
  } catch {
    availability.value = clinicAvailability.value
  }
}

async function handleBook() {
  if (!selectedDate.value || !selectedSlot.value) return
  booking.value = true
  bookingError.value = null
  try {
    await bookAppointment({
      clinicId,
      doctorId: selectedDoctorId.value ?? undefined,
      departmentId: selectedDepartmentId.value ?? undefined,
      date: selectedDate.value,
      startTime: selectedSlot.value.start,
      endTime: selectedSlot.value.end,
      notes: notes.value || undefined,
    })
    bookingSuccess.value = true
  } catch (e) {
    bookingError.value = e instanceof Error ? e.message : 'Booking failed'
  } finally {
    booking.value = false
  }
}

function getInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? '?'
}

onMounted(async () => {
  // Critical: clinic info + availability — without these, booking is impossible
  try {
    const [c, avail] = await Promise.all([getClinic(clinicId), getClinicAvailability(clinicId)])
    clinic.value = c
    clinicAvailability.value = avail
    availability.value = avail
  } catch {
    loadError.value = 'Failed to load clinic information. Please refresh.'
    loading.value = false
    return
  }

  // Non-critical: departments + doctors — each fetched independently so one failure
  // cannot silently block the other from loading
  const [deptsResult, docsResult] = await Promise.allSettled([
    getDepartments(clinicId),
    getClinicDoctors(clinicId),
  ])
  if (deptsResult.status === 'fulfilled') departments.value = deptsResult.value
  if (docsResult.status === 'fulfilled') doctors.value = docsResult.value

  // Pre-select from query params
  try {
    const queryDoctorId = route.query['doctorId'] as string | undefined
    const queryDeptId = route.query['deptId'] as string | undefined

    if (queryDoctorId) {
      const match = doctors.value.find((d) => d.userId === queryDoctorId)
      if (match) await selectDoctor(match)
    } else if (queryDeptId) {
      selectedDepartmentId.value = queryDeptId
      doctors.value = await getClinicDoctors(clinicId, queryDeptId)
    }
  } catch {
    // pre-selection failure is non-fatal
  }

  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b px-4 py-3 flex items-center gap-3">
      <button
        class="text-gray-500 hover:text-gray-800 p-1 rounded"
        @click="router.push('/clinics')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-lg font-semibold">{{ clinic?.name ?? 'Clinic' }}</h1>
    </header>

    <div v-if="loading" class="flex justify-center py-16 text-gray-400">Loading...</div>

    <div v-else-if="bookingSuccess" class="max-w-md mx-auto p-6 mt-8 text-center">
      <div
        class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Appointment Booked!</h2>
      <p class="text-gray-500 mb-1">
        Your appointment at {{ clinic?.name }} on {{ selectedDate }} from
        {{ selectedSlot ? formatTime(selectedSlot.start) : '' }} to
        {{ selectedSlot ? formatTime(selectedSlot.end) : '' }} has been booked.
      </p>
      <p v-if="selectedDoctor" class="text-gray-500 mb-1">
        Doctor: <span class="font-medium">{{ selectedDoctor.name }}</span>
      </p>
      <p v-if="selectedDepartment" class="text-gray-500 mb-4">
        Department: <span class="font-medium">{{ selectedDepartment.name }}</span>
      </p>
      <button
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="router.push('/calendar')"
      >
        View in Calendar
      </button>
    </div>

    <div v-else-if="loadError" class="max-w-md mx-auto p-6 mt-8 text-center text-red-500">
      {{ loadError }}
    </div>

    <div v-else class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <!-- Clinic info -->
      <div class="bg-white rounded-xl border p-4">
        <h2 class="font-semibold text-lg text-gray-800">{{ clinic?.name }}</h2>
        <p v-if="clinic?.address" class="text-sm text-gray-500 mt-1">{{ clinic.address }}</p>
        <p v-if="clinic?.phone" class="text-sm text-gray-500">{{ clinic.phone }}</p>
        <p v-if="clinic?.description" class="text-sm text-gray-600 mt-2">
          {{ clinic.description }}
        </p>
      </div>

      <!-- Calendar for picking date -->
      <div class="bg-white rounded-xl border p-4">
        <div class="flex items-center justify-between mb-4">
          <span class="font-medium text-gray-800">{{ headerLabel }}</span>
          <div class="flex gap-1">
            <button
              class="p-1 rounded hover:bg-gray-100"
              @click="
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
              "
            >
              <svg
                class="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              class="p-1 rounded hover:bg-gray-100"
              @click="
                currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
              "
            >
              <svg
                class="w-4 h-4 text-gray-500"
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
            </button>
          </div>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 mb-1">
          <div
            v-for="day in DAY_NAMES"
            :key="day"
            class="text-center text-xs font-medium text-gray-400 py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Date grid -->
        <div class="grid grid-cols-7 gap-y-1">
          <div v-for="(day, idx) in monthGrid" :key="idx" class="flex justify-center">
            <button
              :class="[
                'w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors',
                !isSameMonth(day)
                  ? 'text-gray-300 cursor-default'
                  : isPast(day) && !isToday(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : !hasAvailability(day)
                      ? 'text-gray-400 cursor-not-allowed'
                      : selectedDate === toDateStr(day)
                        ? 'bg-blue-600 text-white font-semibold'
                        : isToday(day)
                          ? 'border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50'
                          : 'hover:bg-blue-50 text-gray-800 font-medium',
              ]"
              :disabled="
                !isSameMonth(day) || (isPast(day) && !isToday(day)) || !hasAvailability(day)
              "
              @click="selectDate(day)"
            >
              {{ day.getDate() }}
            </button>
          </div>
        </div>

        <p v-if="availability.length === 0" class="text-center text-sm text-gray-400 mt-4">
          This clinic has not set availability yet.
        </p>
        <div v-else class="flex items-center gap-1.5 mt-3">
          <div class="w-3 h-3 rounded-full bg-blue-600" />
          <span class="text-xs text-gray-500">Days with availability</span>
        </div>
      </div>

      <!-- Step 2: Department selection -->
      <div v-if="showDepartmentStep" class="bg-white rounded-xl border p-4">
        <h3 class="font-medium text-gray-700 text-sm mb-3">Select Department</h3>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              selectedDepartmentId === null && departmentSelectionMade
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            ]"
            @click="selectDepartment(null)"
          >
            Any
          </button>
          <button
            v-for="dept in departments"
            :key="dept.id"
            :class="[
              'px-3 py-1.5 rounded-full text-sm border transition-colors',
              selectedDepartmentId === dept.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            ]"
            @click="selectDepartment(dept.id)"
          >
            {{ dept.name }}
          </button>
        </div>
      </div>

      <!-- Step 3: Doctor selection -->
      <div v-if="showDoctorStep" class="bg-white rounded-xl border p-4">
        <h3 class="font-medium text-gray-700 text-sm mb-3">Select Doctor</h3>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
              selectedDoctorId === null && doctorSelectionMade
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            ]"
            @click="selectDoctor(null)"
          >
            Any Available
          </button>
          <button
            v-for="doc in doctors"
            :key="doc.userId"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
              selectedDoctorId === doc.userId
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50',
            ]"
            @click="selectDoctor(doc)"
          >
            <span
              :class="[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                selectedDoctorId === doc.userId
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-100 text-blue-700',
              ]"
            >
              {{ getInitial(doc.name) }}
            </span>
            <span>{{ doc.name }}</span>
            <span
              v-if="doc.departmentName"
              :class="[
                'text-xs px-1.5 py-0.5 rounded-full',
                selectedDoctorId === doc.userId
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500',
              ]"
            >
              {{ doc.departmentName }}
            </span>
          </button>
        </div>
      </div>

      <!-- Step 4: Time slots -->
      <div v-if="showTimeSlots" class="bg-white rounded-xl border p-4">
        <h3 class="font-medium text-gray-800 mb-3">Available times for {{ selectedDate }}</h3>
        <div v-if="selectedDateSlots.length === 0" class="text-sm text-gray-400">
          No slots available for this day.
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="slot in selectedDateSlots"
            :key="slot.start"
            :class="[
              'px-4 py-2 rounded-lg text-sm border transition-colors',
              selectedSlot?.start === slot.start
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-blue-50 text-gray-700 border-gray-200',
            ]"
            @click="selectedSlot = { start: slot.start, end: slot.end }"
          >
            {{ slot.label }}
          </button>
        </div>
      </div>

      <!-- Notes + confirm -->
      <div v-if="selectedSlot" class="bg-white rounded-xl border p-4">
        <h3 class="font-medium text-gray-800 mb-3">Confirm Booking</h3>
        <div class="text-sm text-gray-600 mb-3">
          <p><span class="font-medium">Date:</span> {{ selectedDate }}</p>
          <p>
            <span class="font-medium">Time:</span> {{ formatTime(selectedSlot.start) }} –
            {{ formatTime(selectedSlot.end) }}
          </p>
          <p v-if="selectedDoctor">
            <span class="font-medium">Doctor:</span> {{ selectedDoctor.name }}
          </p>
          <p v-if="selectedDepartment">
            <span class="font-medium">Department:</span> {{ selectedDepartment.name }}
          </p>
        </div>
        <textarea
          v-model="notes"
          placeholder="Notes (optional)"
          rows="2"
          class="w-full border rounded-lg px-3 py-2 text-sm resize-none mb-3"
        />
        <div v-if="bookingError" class="text-sm text-red-600 bg-red-50 rounded p-2 mb-3">
          {{ bookingError }}
        </div>
        <button
          :disabled="booking"
          class="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          @click="handleBook"
        >
          {{ booking ? 'Booking...' : 'Book Appointment' }}
        </button>
      </div>
    </div>
  </div>
</template>
