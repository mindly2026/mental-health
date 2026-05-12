import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginPage from '../pages/LoginPage.vue'
import OAuthCallbackPage from '../pages/OAuthCallbackPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'

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
      path: '/auth/callback/:provider',
      name: 'oauth-callback',
      component: OAuthCallbackPage,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardPage,
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
