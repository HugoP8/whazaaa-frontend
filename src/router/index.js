import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import CampaignsView from '@/views/campaigns/CampaignsView.vue'
import NewCampaignView from '@/views/campaigns/NewCampaignView.vue'
import CampaignDetailView from '@/views/campaigns/CampaignDetailView.vue'
import ContactsView from '@/views/contacts/ContactsView.vue'
import SettingsView from '@/views/settings/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterView
      }
    ]
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: CampaignsView
      },
      {
        path: 'campaigns/new',
        name: 'NewCampaign',
        component: NewCampaignView
      },
      {
        path: 'campaigns/:id',
        name: 'CampaignDetail',
        component: CampaignDetailView
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: ContactsView
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Espera a que la autenticación se inicialice
  if (!store.getters['auth/isInitialized']) {
    try {
      await store.dispatch('auth/initialize')
    } catch (error) {
      console.error('Error inicializando auth:', error)
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = store.getters['auth/isAuthenticated']

  if (requiresAuth && !isAuthenticated) {
    next('/auth/login')
  } else if ((to.path === '/auth/login' || to.path === '/auth/register') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router