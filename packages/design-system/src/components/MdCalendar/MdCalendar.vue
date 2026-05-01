<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: Date
  markedDates?: Date[]
}

const props = withDefaults(defineProps<Props>(), {
  markedDates: () => [],
})

const emit = defineEmits<{ 'update:modelValue': [date: Date] }>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const displayYear = ref(props.modelValue ? props.modelValue.getFullYear() : today.getFullYear())
const displayMonth = ref(props.modelValue ? props.modelValue.getMonth() : today.getMonth())

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

const monthLabel = computed(() => `${MONTH_NAMES[displayMonth.value]} ${displayYear.value}`)

function prevMonth() {
  if (displayMonth.value === 0) {
    displayMonth.value = 11
    displayYear.value--
  } else {
    displayMonth.value--
  }
}

function nextMonth() {
  if (displayMonth.value === 11) {
    displayMonth.value = 0
    displayYear.value++
  } else {
    displayMonth.value++
  }
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isMarked(date: Date) {
  return props.markedDates.some((d) => isSameDay(d, date))
}

interface CalDay {
  date: Date
  dayNum: number
  isOtherMonth: boolean
  isToday: boolean
  isSelected: boolean
  isWeekend: boolean
  hasEntry: boolean
}

const daysGrid = computed<CalDay[]>(() => {
  const year = displayYear.value
  const month = displayMonth.value

  // First day of month (0 = Sun)
  const firstDow = new Date(year, month, 1).getDay()
  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Days in prev month
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: CalDay[] = []

  // Leading days from previous month
  for (let i = firstDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrev - i)
    date.setHours(0, 0, 0, 0)
    cells.push({
      date,
      dayNum: date.getDate(),
      isOtherMonth: true,
      isToday: isSameDay(date, today),
      isSelected: props.modelValue ? isSameDay(date, props.modelValue) : false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      hasEntry: isMarked(date),
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    cells.push({
      date,
      dayNum: d,
      isOtherMonth: false,
      isToday: isSameDay(date, today),
      isSelected: props.modelValue ? isSameDay(date, props.modelValue) : false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      hasEntry: isMarked(date),
    })
  }

  // Trailing days to fill grid (always show 6 rows = 42 cells)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d)
    date.setHours(0, 0, 0, 0)
    cells.push({
      date,
      dayNum: d,
      isOtherMonth: true,
      isToday: isSameDay(date, today),
      isSelected: props.modelValue ? isSameDay(date, props.modelValue) : false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      hasEntry: isMarked(date),
    })
  }

  return cells
})

function selectDay(cell: CalDay) {
  emit('update:modelValue', cell.date)
  if (cell.isOtherMonth) {
    displayYear.value = cell.date.getFullYear()
    displayMonth.value = cell.date.getMonth()
  }
}
</script>

<template>
  <div class="md-calendar" v-bind="$attrs">
    <!-- Header -->
    <div class="md-cal-header">
      <button class="md-cal-nav" type="button" aria-label="Previous month" @click="prevMonth">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span class="md-cal-month">{{ monthLabel }}</span>
      <button class="md-cal-nav" type="button" aria-label="Next month" @click="nextMonth">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Day-of-week labels -->
    <div class="md-cal-dow">
      <span v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d">{{ d }}</span>
    </div>

    <!-- Days grid -->
    <div class="md-cal-grid">
      <button
        v-for="(cell, i) in daysGrid"
        :key="i"
        type="button"
        :class="[
          'md-cal-day',
          {
            'md-cal-day--other-month': cell.isOtherMonth,
            'md-cal-day--today': cell.isToday,
            'md-cal-day--selected': cell.isSelected && !cell.isToday,
            'md-cal-day--has-entry': cell.hasEntry,
            'md-cal-day--weekend': cell.isWeekend && !cell.isToday && !cell.isSelected,
          },
        ]"
        :aria-label="`${cell.date.toDateString()}${cell.hasEntry ? ', has entry' : ''}`"
        :aria-pressed="cell.isSelected"
        @click="selectDay(cell)"
      >
        {{ cell.dayNum }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.md-calendar {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 24px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(27, 58, 110, 0.1));
  padding: 20px;
  width: 320px;
  user-select: none;
}

/* Header */
.md-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.md-cal-month {
  font-family: var(--font-heading, 'Nunito', system-ui, sans-serif);
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #1b3a6e);
}

.md-cal-nav {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--neutral-100, #ebf0f7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-600, #456f90);
  transition:
    background var(--duration-fast, 200ms),
    color var(--duration-fast, 200ms);
}

.md-cal-nav:hover {
  background: var(--blue-50, #ebf5fb);
  color: var(--color-primary, #5b9fd4);
}

/* Day-of-week */
.md-cal-dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 6px;
}

.md-cal-dow span {
  text-align: center;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--neutral-400, #8baec8);
  padding: 4px 0;
  text-transform: uppercase;
}

/* Days grid */
.md-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.md-cal-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-family: var(--font-body, 'DM Sans', system-ui, sans-serif);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary, #456f90);
  cursor: pointer;
  border: none;
  background: transparent;
  transition:
    background var(--duration-fast, 200ms),
    color var(--duration-fast, 200ms);
  position: relative;
}

.md-cal-day:hover:not(.md-cal-day--today) {
  background: var(--blue-50, #ebf5fb);
  color: var(--color-primary, #5b9fd4);
}

.md-cal-day--other-month {
  color: var(--neutral-300, #b8ccde);
}

.md-cal-day--weekend {
  color: var(--neutral-400, #8baec8);
}

.md-cal-day--today {
  background: var(--color-primary, #5b9fd4);
  color: #fff;
  font-weight: 700;
}

.md-cal-day--today:hover {
  background: var(--color-primary-hover, #4a8dc2);
}

.md-cal-day--selected {
  background: var(--blue-50, #ebf5fb);
  color: var(--color-primary, #5b9fd4);
  font-weight: 700;
  box-shadow: 0 0 0 2px var(--color-primary, #5b9fd4);
}

/* Entry dot */
.md-cal-day--has-entry::after {
  content: '';
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--color-secondary, #62beb0);
}

.md-cal-day--today.md-cal-day--has-entry::after {
  background: rgba(255, 255, 255, 0.8);
}
</style>
