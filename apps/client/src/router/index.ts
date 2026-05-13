import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import CalendarPage from '../pages/CalendarPage.vue'
import ClinicsPage from '../pages/ClinicsPage.vue'
import ClinicDetailPage from '../pages/ClinicDetailPage.vue'
import AvailabilityPage from '../pages/AvailabilityPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarPage,
    },
    {
      path: '/clinics',
      name: 'clinics',
      component: ClinicsPage,
    },
    {
      path: '/clinics/:id',
      name: 'clinic-detail',
      component: ClinicDetailPage,
    },
    {
      path: '/availability',
      name: 'availability',
      component: AvailabilityPage,
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
