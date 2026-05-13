<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Department } from '@mental-health/contract'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getMyClinic,
} from '../services/api'

const router = useRouter()

const clinicId = ref<string | null>(null)
const departments = ref<Department[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)

// New department form
const newName = ref('')
const newDescription = ref('')
const showForm = ref(false)

// Edit state
const editingId = ref<string | null>(null)
const editName = ref('')
const editDescription = ref('')

onMounted(async () => {
  try {
    const clinic = await getMyClinic()
    clinicId.value = clinic.id
    departments.value = await getDepartments(clinic.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load departments'
  } finally {
    loading.value = false
  }
})

function cancelNewForm() {
  showForm.value = false
  newName.value = ''
  newDescription.value = ''
}

async function handleCreate() {
  if (!clinicId.value || !newName.value.trim()) return
  saving.value = true
  saveError.value = null
  try {
    const dept = await createDepartment(clinicId.value, {
      name: newName.value.trim(),
      description: newDescription.value.trim() || undefined,
    })
    departments.value.push(dept)
    newName.value = ''
    newDescription.value = ''
    showForm.value = false
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to create department'
  } finally {
    saving.value = false
  }
}

function startEdit(dept: Department) {
  editingId.value = dept.id
  editName.value = dept.name
  editDescription.value = dept.description ?? ''
}

async function handleUpdate(deptId: string) {
  if (!clinicId.value || !editName.value.trim()) return
  saving.value = true
  saveError.value = null
  try {
    const updated = await updateDepartment(clinicId.value, deptId, {
      name: editName.value.trim(),
      description: editDescription.value.trim() || undefined,
    })
    const idx = departments.value.findIndex((d) => d.id === deptId)
    if (idx !== -1) departments.value[idx] = updated
    editingId.value = null
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to update department'
  } finally {
    saving.value = false
  }
}

async function handleDelete(deptId: string) {
  if (!clinicId.value) return
  if (
    !confirm(
      'Delete this department? Appointments linked to it will lose their department assignment.',
    )
  )
    return
  try {
    await deleteDepartment(clinicId.value, deptId)
    departments.value = departments.value.filter((d) => d.id !== deptId)
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to delete department'
  }
}
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
      <h1 class="text-lg font-semibold text-gray-800">Departments</h1>
      <button
        class="ml-auto text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        @click="showForm = !showForm"
      >
        + Add
      </button>
    </header>

    <div class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <!-- Loading / Error -->
      <div v-if="loading" class="text-gray-400 text-sm text-center py-8">Loading…</div>
      <div v-else-if="error" class="text-red-600 bg-red-50 rounded p-3 text-sm">{{ error }}</div>

      <template v-else>
        <!-- Save error -->
        <div v-if="saveError" class="text-sm text-red-600 bg-red-50 rounded p-2">
          {{ saveError }}
        </div>

        <!-- New department form -->
        <div v-if="showForm" class="bg-white rounded-xl border p-4 flex flex-col gap-3">
          <p class="text-sm font-medium text-gray-700">New department</p>
          <input
            v-model="newName"
            type="text"
            placeholder="Department name"
            class="border rounded px-3 py-2 text-sm"
          />
          <textarea
            v-model="newDescription"
            placeholder="Description (optional)"
            rows="2"
            class="border rounded px-3 py-2 text-sm resize-none"
          />
          <div class="flex gap-2">
            <button
              class="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              :disabled="saving || !newName.trim()"
              @click="handleCreate"
            >
              {{ saving ? 'Saving…' : 'Create' }}
            </button>
            <button
              class="px-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              @click="cancelNewForm"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="departments.length === 0 && !showForm"
          class="text-center text-gray-400 text-sm py-10"
        >
          No departments yet. Add one to organise your doctors.
        </div>

        <!-- Department list -->
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="bg-white rounded-xl border p-4 flex flex-col gap-2"
        >
          <!-- View mode -->
          <template v-if="editingId !== dept.id">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-medium text-gray-800">{{ dept.name }}</p>
                <p v-if="dept.description" class="text-sm text-gray-500 mt-0.5">
                  {{ dept.description }}
                </p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button
                  class="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 border rounded transition-colors"
                  @click="startEdit(dept)"
                >
                  Edit
                </button>
                <button
                  class="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded transition-colors"
                  @click="handleDelete(dept.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <input v-model="editName" type="text" class="border rounded px-3 py-2 text-sm" />
            <textarea
              v-model="editDescription"
              rows="2"
              placeholder="Description (optional)"
              class="border rounded px-3 py-2 text-sm resize-none"
            />
            <div class="flex gap-2">
              <button
                class="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                :disabled="saving || !editName.trim()"
                @click="handleUpdate(dept.id)"
              >
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
              <button
                class="px-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                @click="editingId = null"
              >
                Cancel
              </button>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
