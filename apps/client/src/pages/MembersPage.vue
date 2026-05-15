<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ClinicMemberWithUser, Department } from '@mental-health/contract'
import {
  getMembers,
  inviteMember,
  updateMember,
  removeMember,
  getMyClinic,
  getDepartments,
} from '../services/api'

const router = useRouter()

const clinicId = ref<string | null>(null)
const members = ref<ClinicMemberWithUser[]>([])
const departments = ref<Department[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const saveError = ref<string | null>(null)
const showInviteForm = ref(false)

// Invite form
const inviteEmail = ref('')
const inviteName = ref('')
const inviteRole = ref<'doctor' | 'staff'>('doctor')
const inviteDeptId = ref('')

// Filter
const filterRole = ref<'all' | 'doctor' | 'staff'>('all')

const filteredMembers = computed(() => {
  if (filterRole.value === 'all') return members.value
  return members.value.filter((m) => m.role === filterRole.value)
})

onMounted(async () => {
  try {
    const clinic = await getMyClinic()
    clinicId.value = clinic.id
    const [m, d] = await Promise.all([getMembers(clinic.id), getDepartments(clinic.id)])
    members.value = m
    departments.value = d
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load members'
  } finally {
    loading.value = false
  }
})

async function handleInvite() {
  if (!clinicId.value || !inviteEmail.value.trim()) return
  saving.value = true
  saveError.value = null
  try {
    const member = await inviteMember(clinicId.value, {
      email: inviteEmail.value.trim(),
      name: inviteName.value.trim() || undefined,
      role: inviteRole.value,
      departmentId: inviteDeptId.value || undefined,
    })
    members.value.push(member)
    inviteEmail.value = ''
    inviteName.value = ''
    inviteRole.value = 'doctor'
    inviteDeptId.value = ''
    showInviteForm.value = false
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to invite member'
  } finally {
    saving.value = false
  }
}

async function handleStatusToggle(member: ClinicMemberWithUser) {
  if (!clinicId.value) return
  const newStatus = member.status === 'active' ? 'suspended' : 'active'
  try {
    const updated = await updateMember(clinicId.value, member.id, { status: newStatus })
    const idx = members.value.findIndex((m) => m.id === member.id)
    if (idx !== -1) members.value[idx] = { ...members.value[idx]!, ...updated }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to update member'
  }
}

async function handleRemove(memberId: string) {
  if (!clinicId.value) return
  if (!confirm('Remove this member from your clinic?')) return
  try {
    await removeMember(clinicId.value, memberId)
    members.value = members.value.filter((m) => m.id !== memberId)
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to remove member'
  }
}

async function handleDepartmentChange(member: ClinicMemberWithUser, deptId: string) {
  if (!clinicId.value) return
  const newDeptId = deptId || null
  try {
    const updated = await updateMember(clinicId.value, member.id, { departmentId: newDeptId })
    const idx = members.value.findIndex((m) => m.id === member.id)
    if (idx !== -1) {
      const dept = departments.value.find((d) => d.id === newDeptId)
      members.value[idx] = {
        ...members.value[idx]!,
        ...updated,
        departmentName: dept?.name ?? null,
      }
    }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Failed to update department'
  }
}

function statusColor(status: string) {
  if (status === 'active') return 'bg-green-100 text-green-700'
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-500'
}

function roleColor(role: string) {
  return role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
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
      <h1 class="text-lg font-semibold text-gray-800">Members</h1>
      <button
        class="ml-auto text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        @click="showInviteForm = !showInviteForm"
      >
        + Invite
      </button>
    </header>

    <div class="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <div v-if="loading" class="text-gray-400 text-sm text-center py-8">Loading…</div>
      <div v-else-if="error" class="text-red-600 bg-red-50 rounded p-3 text-sm">{{ error }}</div>

      <template v-else>
        <div v-if="saveError" class="text-sm text-red-600 bg-red-50 rounded p-2">
          {{ saveError }}
        </div>

        <!-- Invite form -->
        <div v-if="showInviteForm" class="bg-white rounded-xl border p-4 flex flex-col gap-3">
          <p class="text-sm font-medium text-gray-700">Invite a doctor or staff member</p>
          <p class="text-xs text-gray-400">
            If they don't have an account yet, they'll receive an invite to set their password.
          </p>

          <input
            v-model="inviteEmail"
            type="email"
            placeholder="Email address *"
            required
            class="border rounded px-3 py-2 text-sm"
          />
          <input
            v-model="inviteName"
            type="text"
            placeholder="Full name (optional)"
            class="border rounded px-3 py-2 text-sm"
          />

          <!-- Role toggle -->
          <div class="flex rounded-lg border overflow-hidden text-sm">
            <button
              :class="[
                'flex-1 py-2 transition-colors',
                inviteRole === 'doctor'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ]"
              type="button"
              @click="inviteRole = 'doctor'"
            >
              Doctor
            </button>
            <button
              :class="[
                'flex-1 py-2 transition-colors',
                inviteRole === 'staff'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ]"
              type="button"
              @click="inviteRole = 'staff'"
            >
              Staff
            </button>
          </div>

          <select v-model="inviteDeptId" class="border rounded px-3 py-2 text-sm text-gray-700">
            <option value="">No department</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>

          <div class="flex gap-2">
            <button
              class="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              :disabled="saving || !inviteEmail.trim()"
              @click="handleInvite"
            >
              {{ saving ? 'Inviting…' : 'Send invite' }}
            </button>
            <button
              class="px-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              @click="showInviteForm = false"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Role filter -->
        <div class="flex gap-2 text-sm">
          <button
            v-for="opt in [
              { label: 'All', value: 'all' },
              { label: 'Doctors', value: 'doctor' },
              { label: 'Staff', value: 'staff' },
            ]"
            :key="opt.value"
            :class="[
              'px-3 py-1.5 rounded-lg border transition-colors',
              filterRole === opt.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            ]"
            @click="filterRole = opt.value as typeof filterRole"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filteredMembers.length === 0" class="text-center text-gray-400 text-sm py-10">
          No members found. Invite doctors and staff to your clinic.
        </div>

        <!-- Member list -->
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="bg-white rounded-xl border p-4 flex items-start gap-3"
        >
          <div
            class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-sm font-semibold text-gray-600"
          >
            {{ member.userName.slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-medium text-gray-800 truncate">{{ member.userName }}</p>
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                  roleColor(member.role),
                ]"
              >
                {{ member.role }}
              </span>
              <span
                :class="[
                  'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                  statusColor(member.status),
                ]"
              >
                {{ member.status }}
              </span>
            </div>
            <p class="text-xs text-gray-400 truncate mt-0.5">{{ member.userEmail }}</p>
            <div v-if="departments.length > 0" class="mt-1.5">
              <select
                :value="member.departmentId ?? ''"
                class="text-xs border rounded px-2 py-1 text-gray-600 bg-white w-full max-w-[180px]"
                @change="handleDepartmentChange(member, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">No department</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <p v-if="member.status === 'pending'" class="text-xs text-yellow-600 mt-1">
              Waiting for account setup
            </p>
          </div>
          <div class="flex flex-col gap-1.5 shrink-0">
            <button
              v-if="member.status !== 'pending'"
              class="text-xs px-2 py-1 border rounded transition-colors"
              :class="
                member.status === 'active'
                  ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                  : 'text-green-600 border-green-200 hover:bg-green-50'
              "
              @click="handleStatusToggle(member)"
            >
              {{ member.status === 'active' ? 'Suspend' : 'Activate' }}
            </button>
            <button
              class="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded transition-colors"
              @click="handleRemove(member.id)"
            >
              Remove
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
