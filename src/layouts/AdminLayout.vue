<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      color="grey-darken-4"
      width="280"
      permanent
    >
      <!-- Header -->
      <v-list-item class="px-6 py-6">
        <div>
          <div class="text-h5 font-weight-bold white--text mb-2">
            Panel Admin
          </div>
          <v-chip
            :color="userRoleBadge.color"
            size="small"
            class="font-weight-bold"
          >
            {{ userRoleBadge.label }}
          </v-chip>
        </div>
      </v-list-item>

      <v-divider class="mx-4 my-2" color="grey-darken-2"></v-divider>

      <!-- User Info -->
      <v-list-item class="px-6 mb-2">
        <v-list-item-subtitle class="text-grey-lighten-1">
          {{ user?.email }}
        </v-list-item-subtitle>
      </v-list-item>

      <v-divider class="mx-4 my-4" color="grey-darken-2"></v-divider>

      <!-- Navigation -->
      <v-list nav dense color="transparent">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          color="white"
          rounded="xl"
          class="mx-4 my-1"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider class="mx-4 my-4" color="grey-darken-2"></v-divider>

      <!-- Return to Dashboard -->
      <v-list nav dense color="transparent">
        <v-list-item
          to="/dashboard"
          prepend-icon="mdi-arrow-left"
          title="Volver al Dashboard"
          color="primary"
          rounded="xl"
          class="mx-4"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="white" elevation="1">
      <v-app-bar-title>
        <span class="text-h6 font-weight-bold">
          {{ currentPageTitle }}
        </span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
          >
            <v-avatar color="primary" size="40">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ user?.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ user?.email }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar Sesión"
            @click="handleLogout"
          >
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()

const drawer = ref(true)

// Computed
const user = computed(() => store.getters['auth/user'])
const isSuperAdmin = computed(() => store.getters['auth/isSuperAdmin'])

const userRoleBadge = computed(() => {
  const role = user.value?.role
  const badges = {
    superadmin: { label: 'Super Admin', color: 'pink-darken-2' },
    admin: { label: 'Admin', color: 'amber-darken-2' },
    user: { label: 'Usuario', color: 'blue' }
  }
  return badges[role] || badges.user
})

const currentPageTitle = computed(() => {
  const titles = {
    'AdminDashboard': 'Dashboard Administrativo',
    'AdminUsers': 'Gestión de Usuarios',
    'AdminUserDetails': 'Detalles de Usuario',
    'AdminSubscriptions': 'Gestión de Suscripciones',
    'AdminRechargeRequests': 'Solicitudes de Recarga',
    'AdminReports': 'Reportes',
    'AdminPlans': 'Gestión de Planes',
    'AdminSellers': 'Gestión de Vendedores',
    'AdminVideoRewards': 'Video Rewards'
  }
  return titles[route.name] || 'Panel Admin'
})

// Navigation items
const navItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/admin'
  },
  {
    title: 'Usuarios',
    icon: 'mdi-account-multiple',
    to: '/admin/users'
  },
  {
    title: 'Suscripciones',
    icon: 'mdi-crown',
    to: '/admin/subscriptions'
  },
  {
    title: 'Solicitudes Recarga',
    icon: 'mdi-cash-plus',
    to: '/admin/recharge-requests'
  },
  {
    title: 'Vendedores',
    icon: 'mdi-account-tie',
    to: '/admin/sellers'
  },
  {
    title: 'Video Rewards',
    icon: 'mdi-play-circle',
    to: '/admin/video-rewards'
  },
  {
    title: 'Reportes',
    icon: 'mdi-chart-line',
    to: '/admin/reports'
  },
  {
    title: 'Planes',
    icon: 'mdi-package-variant',
    to: '/admin/plans'
  }
]

// Methods
const handleLogout = async () => {
  try {
    await store.dispatch('auth/logout')
  } catch (error) {
    console.error('Error en logout:', error)
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
}

.v-list-item--active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%) !important;
  border-left: 3px solid #3b82f6;
}

.v-list-item:hover:not(.v-list-item--active) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.v-list-item__content) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.v-list-item--active .v-list-item__content) {
  color: #ffffff;
  font-weight: 500;
}

:deep(.v-list-item__prepend .v-icon) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.v-list-item--active .v-list-item__prepend .v-icon) {
  color: #60a5fa;
  opacity: 1;
}

/* Mejoras para el header */
:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* Mejoras para el contenido principal */
:deep(.v-main) {
  background-color: #f8fafc;
}
</style>
