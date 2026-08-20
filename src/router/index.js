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
import BulkMessagesView from '@/views/messages/BulkMessagesView.vue'
import PricingView from '@/views/subscription/PricingView.vue'
import SubscriptionView from '@/views/subscription/SubscriptionView.vue'
import PaymentSuccessView from '@/views/subscription/PaymentSuccessView.vue'
import PaymentCancelledView from '@/views/subscription/PaymentCancelledView.vue'
import CreditHistoryView from '@/views/credits/CreditHistoryView.vue'

// Admin Views
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminUsers from '@/views/admin/AdminUsers.vue'
import AdminUserDetails from '@/views/admin/AdminUserDetails.vue'
import AdminReports from '@/views/admin/AdminReports.vue'
import AdminPlans from '@/views/admin/AdminPlans.vue'
import AdminSubscriptions from '@/views/admin/AdminSubscriptions.vue'
import AdminSellers from '@/views/admin/AdminSellers.vue'
import AdminRechargeRequests from '@/views/admin/AdminRechargeRequests.vue'
import AdminVideoRewards from '@/views/admin/AdminVideoRewards.vue'

// Debug View
import AdminDebug from '@/views/AdminDebug.vue'

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
        path: 'messages',
        name: 'BulkMessages',
        component: BulkMessagesView
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView
      },
      {
        path: 'pricing',
        name: 'Pricing',
        component: PricingView
      },
      {
        path: 'subscription',
        name: 'Subscription',
        component: SubscriptionView
      },
      {
        path: 'payment/success',
        name: 'PaymentSuccess',
        component: PaymentSuccessView
      },
      {
        path: 'payment/cancelled',
        name: 'PaymentCancelled',
        component: PaymentCancelledView
      },
      {
        path: 'credits/history',
        name: 'CreditHistory',
        component: CreditHistoryView
      },
      {
        path: 'debug-admin',
        name: 'DebugAdmin',
        component: AdminDebug,
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  // Admin Routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers
      },
      {
        path: 'users/:id',
        name: 'AdminUserDetails',
        component: AdminUserDetails
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: AdminReports
      },
      {
        path: 'plans',
        name: 'AdminPlans',
        component: AdminPlans
      },
      {
        path: 'subscriptions',
        name: 'AdminSubscriptions',
        component: AdminSubscriptions
      },
      {
        path: 'sellers',
        name: 'AdminSellers',
        component: AdminSellers
      },
      {
        path: 'recharge-requests',
        name: 'AdminRechargeRequests',
        component: AdminRechargeRequests
      },
      {
        path: 'video-rewards',
        name: 'AdminVideoRewards',
        component: AdminVideoRewards
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
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isAdmin = store.getters['auth/isAdmin']

  // Verificar autenticación
  if (requiresAuth && !isAuthenticated) {
    next('/auth/login')
  }
  // Verificar permisos de admin
  else if (requiresAdmin && !isAdmin) {
    console.warn('[Router] Acceso denegado a ruta de admin')
    next('/dashboard')
  }
  // Si ya está autenticado, no permitir acceso a login/register
  else if ((to.path === '/auth/login' || to.path === '/auth/register') && isAuthenticated) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router