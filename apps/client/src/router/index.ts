import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../layouts/AuthLayout.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import SetupAccountPage from '../pages/SetupAccountPage.vue'
import ClinicSelectPage from '../pages/ClinicSelectPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import CalendarPage from '../pages/CalendarPage.vue'
import ClinicsPage from '../pages/ClinicsPage.vue'
import ClinicDetailPage from '../pages/ClinicDetailPage.vue'
import AvailabilityPage from '../pages/AvailabilityPage.vue'
import DepartmentsPage from '../pages/DepartmentsPage.vue'
import MembersPage from '../pages/MembersPage.vue'
import DoctorAppointmentsPage from '../pages/DoctorAppointmentsPage.vue'
import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage.vue'
import StaffAppointmentsPage from '../pages/StaffAppointmentsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ─── Public ───────────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { public: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupPage,
      meta: { public: true },
    },
    {
      path: '/setup-account',
      name: 'setup-account',
      component: SetupAccountPage,
      meta: { public: true },
    },

    // ─── Authenticated (with left nav sidebar) ────────────────────
    {
      path: '/',
      component: AuthLayout,
      children: [
        // ─── Common ─────────────────────────────────────────────
        {
          path: '',
          name: 'dashboard',
          component: DashboardPage,
        },
        {
          path: 'select-clinic',
          name: 'select-clinic',
          component: ClinicSelectPage,
        },

        // ─── Customer ───────────────────────────────────────────
        {
          path: 'calendar',
          name: 'calendar',
          component: CalendarPage,
        },
        {
          path: 'clinics',
          name: 'clinics',
          component: ClinicsPage,
        },
        {
          path: 'clinics/:id',
          name: 'clinic-detail',
          component: ClinicDetailPage,
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('../pages/SearchPage.vue'),
        },

        // ─── Clinic owner ────────────────────────────────────────
        {
          path: 'availability',
          name: 'availability',
          component: AvailabilityPage,
        },
        {
          path: 'departments',
          name: 'departments',
          component: DepartmentsPage,
        },
        {
          path: 'members',
          name: 'members',
          component: MembersPage,
        },

        // ─── Doctor ──────────────────────────────────────────────
        {
          path: 'doctor/appointments',
          name: 'doctor-appointments',
          component: DoctorAppointmentsPage,
        },
        {
          path: 'doctor/availability',
          name: 'doctor-availability',
          component: DoctorAvailabilityPage,
        },

        // ─── Staff ───────────────────────────────────────────────
        {
          path: 'staff/appointments',
          name: 'staff-appointments',
          component: StaffAppointmentsPage,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (!to.meta['public'] && !isAuthenticated()) {
    return { name: 'login' }
  }
})

export default router
