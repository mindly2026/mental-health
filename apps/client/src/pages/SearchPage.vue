<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { SearchType, SearchResponse } from '@mental-health/contract'
import { search } from '../services/api'

const router = useRouter()

const query = ref('')
const activeTab = ref<SearchType>('clinic')
const results = ref<SearchResponse | null>(null)
const loading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function doSearch() {
  if (!query.value.trim()) {
    results.value = null
    return
  }
  loading.value = true
  try {
    results.value = await search(activeTab.value, query.value.trim())
  } catch {
    results.value = null
  } finally {
    loading.value = false
  }
}

watch(query, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doSearch, 300)
})

function switchTab(tab: SearchType) {
  activeTab.value = tab
  results.value = null
  if (query.value.trim()) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(doSearch, 300)
  }
}

function goToClinic(clinicId: string) {
  void router.push(`/clinics/${clinicId}`)
}

function goToClinicWithDoctor(clinicId: string, doctorUserId: string) {
  void router.push(`/clinics/${clinicId}?doctorId=${doctorUserId}`)
}

function goToClinicWithDept(clinicId: string, departmentId: string) {
  void router.push(`/clinics/${clinicId}?deptId=${departmentId}`)
}
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
      <h1 class="text-lg font-semibold">Search</h1>
    </header>

    <div class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <!-- Search input -->
      <div class="relative">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
        <input
          v-model="query"
          type="text"
          placeholder="Search..."
          class="w-full bg-white border rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white border rounded-xl p-1">
        <button
          v-for="tab in ['clinic', 'doctor', 'department'] as SearchType[]"
          :key="tab"
          :class="[
            'flex-1 py-2 text-sm rounded-lg font-medium capitalize transition-colors',
            activeTab === tab
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
          @click="switchTab(tab)"
        >
          {{ tab === 'clinic' ? 'Clinics' : tab === 'doctor' ? 'Doctors' : 'Departments' }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8 text-gray-400 text-sm">Searching...</div>

      <!-- Empty state -->
      <div v-else-if="!query.trim()" class="text-center py-12 text-gray-400 text-sm">
        Enter a name to search
      </div>

      <!-- No results -->
      <div
        v-else-if="
          results &&
          ((results.type === 'clinic' && (results.clinics?.length ?? 0) === 0) ||
            (results.type === 'doctor' && (results.doctors?.length ?? 0) === 0) ||
            (results.type === 'department' && (results.departments?.length ?? 0) === 0))
        "
        class="text-center py-12 text-gray-400 text-sm"
      >
        No results found for "{{ query }}"
      </div>

      <!-- Clinic results -->
      <div
        v-else-if="results?.type === 'clinic' && results.clinics?.length"
        class="flex flex-col gap-2"
      >
        <button
          v-for="clinic in results.clinics"
          :key="clinic.id"
          class="bg-white rounded-xl border p-4 text-left flex items-center gap-3 hover:shadow-md transition-shadow w-full"
          @click="goToClinic(clinic.id)"
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
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800">{{ clinic.name }}</p>
            <p v-if="clinic.address" class="text-sm text-gray-500 truncate">{{ clinic.address }}</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 shrink-0"
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

      <!-- Doctor results -->
      <div
        v-else-if="results?.type === 'doctor' && results.doctors?.length"
        class="flex flex-col gap-3"
      >
        <div
          v-for="doc in results.doctors"
          :key="doc.userId"
          class="bg-white rounded-xl border p-4"
        >
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-700 font-semibold text-sm"
            >
              {{ doc.name.trim()[0]?.toUpperCase() ?? '?' }}
            </div>
            <p class="font-medium text-gray-800">{{ doc.name }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="clinic in doc.clinics"
              :key="clinic.clinicId"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors border border-blue-100"
              @click="goToClinicWithDoctor(clinic.clinicId, doc.userId)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"
                />
              </svg>
              {{ clinic.clinicName }}
              <span v-if="clinic.departmentName" class="text-xs text-blue-500"
                >· {{ clinic.departmentName }}</span
              >
            </button>
          </div>
        </div>
      </div>

      <!-- Department results -->
      <div
        v-else-if="results?.type === 'department' && results.departments?.length"
        class="flex flex-col gap-2"
      >
        <button
          v-for="dept in results.departments"
          :key="dept.departmentId"
          class="bg-white rounded-xl border p-4 text-left flex items-center gap-3 hover:shadow-md transition-shadow w-full"
          @click="goToClinicWithDept(dept.clinicId, dept.departmentId)"
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
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-800">{{ dept.name }}</p>
            <p class="text-sm text-gray-500 truncate">{{ dept.clinicName }}</p>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 shrink-0"
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
  </div>
</template>
