<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MdAvatar } from '@mental-health/design-system'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { state, logout } = useAuth()

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleLogout() {
  logout()
  void router.replace('/login')
}

interface NavLink {
  label: string
  to: string
  icon: string
}

const navLinks = computed<NavLink[]>(() => {
  const role = state.user?.role
  const common: NavLink[] = [
    {
      label: 'Dashboard',
      to: '/',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    },
  ]

  if (role === 'customer') {
    return [
      ...common,
      {
        label: 'My Calendar',
        to: '/calendar',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      },
      {
        label: 'Find a Clinic',
        to: '/clinics',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`,
      },
      {
        label: 'Search',
        to: '/search',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
      },
    ]
  }

  if (role === 'clinic') {
    return [
      ...common,
      {
        label: 'Appointments',
        to: '/calendar',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      },
      {
        label: 'Availability',
        to: '/availability',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      },
      {
        label: 'Departments',
        to: '/departments',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>`,
      },
      {
        label: 'Doctors & Staff',
        to: '/members',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      },
    ]
  }

  if (role === 'doctor') {
    return [
      ...common,
      {
        label: 'My Appointments',
        to: '/doctor/appointments',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      },
      {
        label: 'My Availability',
        to: '/doctor/availability',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      },
    ]
  }

  if (role === 'staff') {
    return [
      ...common,
      {
        label: 'Appointments',
        to: '/staff/appointments',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
      },
    ]
  }

  return common
})

function isActive(to: string): boolean {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const collapsed = ref(false)
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Left sidebar -->
    <aside
      :class="[
        'bg-white border-r flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      ]"
    >
      <!-- Brand + collapse toggle -->
      <div class="px-3 py-4 border-b flex items-center gap-2">
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="collapsed = !collapsed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 v-if="!collapsed" class="text-lg font-semibold text-gray-800 truncate">Mindly</h1>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-2 py-4 flex flex-col gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :title="collapsed ? link.label : undefined"
          :class="[
            'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
            collapsed ? 'justify-center' : '',
            isActive(link.to)
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
          ]"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span
            class="shrink-0"
            :class="isActive(link.to) ? 'text-blue-600' : 'text-gray-400'"
            v-html="link.icon"
          />
          <span v-if="!collapsed" class="truncate">{{ link.label }}</span>
        </router-link>
      </nav>

      <!-- User + logout -->
      <div :class="['px-2 py-4 border-t flex items-center gap-3', collapsed ? 'flex-col' : '']">
        <MdAvatar
          v-bind="state.user?.avatarUrl ? { src: state.user.avatarUrl } : {}"
          :initials="state.user ? getInitials(state.user.name) : '?'"
          size="sm"
        />
        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ state.user?.name }}</p>
          <p class="text-xs text-gray-400 truncate">{{ state.user?.email }}</p>
        </div>
        <button
          class="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
          title="Sign out"
          @click="handleLogout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Page content -->
    <main class="flex-1 min-w-0 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
