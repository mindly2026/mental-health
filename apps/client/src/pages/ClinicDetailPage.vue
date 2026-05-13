<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Clinic, ClinicAvailability } from '@mental-health/contract'
import { getClinic, getClinicAvailability, bookAppointment } from '../services/api'

const router = useRouter()
const route = useRoute()
const clinicId = route.params['id'] as string

const clinic = ref<Clinic | null>(null)
const availability = ref<ClinicAvailability[]>([])
const loading = ref(true)
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
}

const selectedDateSlots = computed(() => {
  if (!selectedDate.value) return []
  const d = new Date(selectedDate.value + 'T00:00:00')
  return slotsForDate(d)
})

async function handleBook() {
  if (!selectedDate.value || !selectedSlot.value) return
  booking.value = true
  bookingError.value = null
  try {
    await bookAppointment({
      clinicId,
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

onMounted(async () => {
  try {
    const [c, avail] = await Promise.all([getClinic(clinicId), getClinicAvailability(clinicId)])
    clinic.value = c
    availability.value = avail
  } catch {
    // handle error
  } finally {
    loading.value = false
  }
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
      <p class="text-gray-500 mb-4">
        Your appointment at {{ clinic?.name }} on {{ selectedDate }} from
        {{ selectedSlot ? formatTime(selectedSlot.start) : '' }} to
        {{ selectedSlot ? formatTime(selectedSlot.end) : '' }} has been booked.
      </p>
      <button
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        @click="router.push('/calendar')"
      >
        View in Calendar
      </button>
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

      <!-- Time slots for selected date -->
      <div v-if="selectedDate" class="bg-white rounded-xl border p-4">
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
