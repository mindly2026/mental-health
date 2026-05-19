<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MdAvatar } from '@mental-health/design-system'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { state } = useAuth()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function roleBadgeClass(role: string) {
  const map: Record<string, string> = {
    clinic: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    staff: 'bg-teal-100 text-teal-700',
    customer: 'bg-gray-100 text-gray-600',
  }
  return map[role] ?? 'bg-gray-100 text-gray-600'
}

function roleDisplayName(role: string) {
  const map: Record<string, string> = {
    clinic: 'Clinic / Provider',
    doctor: 'Doctor',
    staff: 'Staff',
    customer: 'Patient',
  }
  return map[role] ?? role
}

// For doctor/staff with multiple clinics, show a "switch clinic" button
const hasMulipleClinics = () =>
  (state.user?.role === 'doctor' || state.user?.role === 'staff') && state.clinics.length > 1

function handleSwitchClinic() {
  void router.push({ name: 'select-clinic' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-md mx-auto p-4 flex flex-col gap-4 pt-6">
      <!-- User card -->
      <div class="bg-white rounded-xl border p-4 flex items-center gap-3">
        <MdAvatar
          v-bind="state.user?.avatarUrl ? { src: state.user.avatarUrl } : {}"
          :initials="state.user ? getInitials(state.user.name) : '?'"
          size="lg"
        />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800">{{ state.user?.name }}</p>
          <p class="text-sm text-gray-500 truncate">{{ state.user?.email }}</p>
          <div class="flex items-center gap-2 flex-wrap mt-1">
            <span
              :class="[
                'text-xs px-2 py-0.5 rounded-full font-medium inline-block',
                roleBadgeClass(state.user?.role ?? ''),
              ]"
            >
              {{ roleDisplayName(state.user?.role ?? '') }}
            </span>
            <!-- Show current clinic for doctor/staff -->
            <span
              v-if="
                (state.user?.role === 'doctor' || state.user?.role === 'staff') &&
                state.selectedClinicId
              "
              class="text-xs text-gray-400 truncate"
            >
              {{
                state.clinics.find((c) => c.clinicId === state.selectedClinicId)?.clinicName ?? ''
              }}
            </span>
          </div>
        </div>
        <button
          v-if="hasMulipleClinics()"
          class="text-xs text-gray-400 hover:text-gray-700 shrink-0 transition-colors"
          @click="handleSwitchClinic"
        >
          Switch
        </button>
      </div>

      <!-- ─── Customer actions ───────────────────────────────────── -->
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

        <router-link
          to="/search"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Search</p>
            <p class="text-sm text-gray-500">Find clinics, doctors, departments</p>
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

      <!-- ─── Clinic owner actions ───────────────────────────────── -->
      <template v-else-if="state.user?.role === 'clinic'">
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

        <router-link
          to="/departments"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div
            class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0"
          >
            <svg
              class="w-5 h-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Departments</p>
            <p class="text-sm text-gray-500">Manage clinic departments</p>
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
          to="/members"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
            <svg
              class="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Doctors & Staff</p>
            <p class="text-sm text-gray-500">Invite and manage members</p>
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

      <!-- ─── Doctor actions ─────────────────────────────────────── -->
      <template v-else-if="state.user?.role === 'doctor'">
        <router-link
          to="/doctor/appointments"
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
            <p class="font-medium text-gray-800">My Appointments</p>
            <p class="text-sm text-gray-500">View your scheduled patients</p>
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
          to="/doctor/availability"
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
            <p class="font-medium text-gray-800">My Availability</p>
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

      <!-- ─── Staff actions ──────────────────────────────────────── -->
      <template v-else-if="state.user?.role === 'staff'">
        <router-link
          to="/staff/appointments"
          class="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
            <svg
              class="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-800">Clinic Appointments</p>
            <p class="text-sm text-gray-500">View all appointments at your clinic</p>
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
