<template>
  <v-app class="modern-app">
    <!-- Modern App Bar -->
    <v-app-bar
      class="modern-app-bar glass-effect"
      :elevation="0"
      flat
      height="72"
    >
      <!-- Mobile Menu Button -->
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-lg-none mobile-menu-btn"
        variant="text"
        color="primary"
      ></v-app-bar-nav-icon>

      <!-- Logo and Title -->
      <div class="app-logo-section" @click="goToDashboard" style="cursor: pointer;">
        <div class="logo-container hover-scale">
          <v-icon
            color="primary"
            size="32"
            class="logo-icon"
          >
            mdi-whatsapp
          </v-icon>
        </div>
        <div class="app-title-container">
          <h1 class="app-title">Whazaaa</h1>
          <span class="app-subtitle">Business Platform</span>
        </div>
      </div>

      <v-spacer></v-spacer>

      <!-- Admin Button (Solo para admins) -->
      <v-btn
        v-if="isAdmin"
        color="purple-darken-2"
        variant="elevated"
        prepend-icon="mdi-shield-crown"
        class="mr-4"
        @click="$router.push('/admin')"
      >
        Panel Admin
      </v-btn>

      <!-- Connection Status -->
      <div class="connection-section">
        <connection-status />
      </div>

      <!-- User Menu -->
      <v-menu
        v-model="userMenuOpen"
        offset-y
        transition="slide-y-transition"
        class="user-menu"
        close-on-content-click
        close-on-back
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="user-btn hover-lift"
            variant="text"
            rounded="lg"
          >
            <v-avatar
              size="40"
              class="user-avatar"
            >
              <v-icon size="24" color="primary">mdi-account-circle</v-icon>
            </v-avatar>
            <div class="user-info hide-mobile">
              <div class="user-name">{{ userDisplayInfo?.name || 'Usuario' }}</div>
              <div class="user-email">{{ userDisplayInfo?.email || 'usuario@email.com' }}</div>
            </div>
            <v-icon class="dropdown-icon hide-mobile">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card class="user-menu-card shadow-xl" rounded="xl" min-width="280">
          <!-- User Header -->
          <div class="user-menu-header">
            <v-avatar size="56" class="user-menu-avatar">
              <v-icon size="32" color="primary">mdi-account-circle</v-icon>
            </v-avatar>
            <div class="user-menu-info">
              <div class="user-menu-name">{{ userDisplayInfo?.name || 'Usuario' }}</div>
              <div class="user-menu-email">{{ userDisplayInfo?.email || 'usuario@email.com' }}</div>
            </div>
          </div>

          <v-divider class="mx-4"></v-divider>

          <!-- Menu Items -->
          <v-list class="user-menu-list" nav>
            <v-list-item
              @click="userMenuOpen = false; $router.push('/settings')"
              prepend-icon="mdi-cog-outline"
              class="menu-item hover-lift"
              rounded="lg"
            >
              <v-list-item-title>Configuración</v-list-item-title>
            </v-list-item>

            <v-list-item
              @click="logout"
              prepend-icon="mdi-logout"
              class="menu-item logout-item hover-lift"
              rounded="lg"
            >
              <v-list-item-title>Cerrar sesión</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>
    <!-- Modern Navigation Drawer -->
    <navigation-drawer v-model="drawer" />

    <!-- Main Content Area -->
    <v-main class="modern-main">
      <div class="main-container">
        <transition name="slide-fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </v-main>

    <!-- Modern Footer -->
    <app-footer />

    <!-- Alerta de créditos bajos -->
    <LowCreditsAlert @recharge="handleRecharge" />
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue'
import AppFooter from '@/components/layout/Footer.vue'
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus.vue'
import LowCreditsAlert from '@/components/credits/LowCreditsAlert.vue'

const store = useStore()
const router = useRouter()
const drawer = ref(true)
const userMenuOpen = ref(false)

const currentUser = computed(() => store.getters['auth/user'])
const userDisplayInfo = computed(() => store.getters['auth/userDisplayInfo'])
const isAdmin = computed(() => {
  const admin = store.getters['auth/isAdmin']
  console.log('[DefaultLayout] isAdmin:', admin)
  console.log('[DefaultLayout] currentUser:', currentUser.value)
  console.log('[DefaultLayout] user role:', currentUser.value?.role)
  return admin
})

const goToDashboard = () => {
  router.push('/dashboard')
}

const logout = () => {
  userMenuOpen.value = false
  store.dispatch('auth/logout')
}

const handleRecharge = () => {
  router.push('/credits/history')
}
</script>

<style scoped>
.modern-app {
  background: linear-gradient(135deg, var(--neutral-50) 0%, #FFFFFF 100%);
}

/* App Bar Styles */
.modern-app-bar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--neutral-200);
  z-index: 1000;
}

.mobile-menu-btn {
  margin-right: var(--space-2);
}

.app-logo-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-100), var(--primary-50));
  border-radius: var(--radius-xl);
  transition: all var(--duration-200) var(--ease-out);
}

.app-logo-section:hover .logo-container {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(37, 211, 102, 0.08));
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
}

.logo-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.app-title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  background: linear-gradient(90deg, #25D366, #128C7E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.app-subtitle {
  font-size: var(--text-xs);
  color: var(--neutral-500);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.connection-section {
  margin-right: var(--space-4);
}

/* User Menu Styles */
.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  margin-right: var(--space-2);
  transition: all var(--duration-200) var(--ease-out);
}

.user-avatar {
  background: linear-gradient(135deg, var(--primary-100), var(--primary-50));
  border: 2px solid var(--primary-200);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--neutral-800);
  line-height: 1.2;
}

.user-email {
  font-size: var(--text-xs);
  color: var(--neutral-500);
  line-height: 1.2;
}

.dropdown-icon {
  color: var(--neutral-400);
  transition: transform var(--duration-200) var(--ease-out);
}

.user-btn:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* User Menu Card */
.user-menu-card {
  margin-top: var(--space-2);
  border: 1px solid var(--neutral-200);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
}

.user-menu-avatar {
  background: linear-gradient(135deg, var(--primary-100), var(--primary-50));
  border: 2px solid var(--primary-200);
}

.user-menu-info {
  flex: 1;
}

.user-menu-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--neutral-800);
  margin-bottom: var(--space-1);
}

.user-menu-email {
  font-size: var(--text-sm);
  color: var(--neutral-500);
}

.user-menu-list {
  padding: var(--space-2) var(--space-4) var(--space-4);
}

.menu-item {
  margin-bottom: var(--space-1);
  border-radius: var(--radius-lg);
  transition: all var(--duration-200) var(--ease-out);
}

.menu-item:hover {
  background: var(--neutral-50);
  transform: translateX(4px);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

/* Main Content Styles */
.modern-main {
  background: transparent;
  min-height: calc(100vh - 72px);
}

.main-container {
  padding: var(--space-6);
  max-width: 100%;
  margin: 0 auto;
}

/* Enhanced Transitions */
.slide-fade-enter-active {
  transition: all var(--duration-300) var(--ease-out);
}

.slide-fade-leave-active {
  transition: all var(--duration-200) cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive Design */
@media (max-width: 960px) {
  .app-title {
    font-size: 1.25rem;
  }

  .app-subtitle {
    display: none;
  }

  .main-container {
    padding: var(--space-4);
  }
}

@media (max-width: 640px) {
  .logo-container {
    width: 40px;
    height: 40px;
  }

  .app-title {
    font-size: 1.125rem;
  }

  .main-container {
    padding: var(--space-3);
  }

  .connection-section {
    margin-right: var(--space-2);
  }

  .user-btn {
    padding: var(--space-1);
    margin-right: var(--space-1);
  }
}

/* Hide/Show utilities */
@media (max-width: 640px) {
  .hide-mobile {
    display: none !important;
  }
}

/* Focus States */
.logo-container:focus-visible,
.user-btn:focus-visible,
.menu-item:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Loading and Animation States */
.modern-app-bar {
  animation: slideInDown var(--duration-500) var(--ease-out);
}

.main-container {
  animation: fadeInUp var(--duration-700) var(--ease-out) 0.2s both;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>