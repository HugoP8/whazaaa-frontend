<template>
  <v-app>
    <!-- Global error message -->
    <v-snackbar
      v-model="showError"
      :timeout="5000"
      color="error"
      location="top right"
      multi-line
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showError = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Main content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Global loading overlay -->
    <v-overlay
      :model-value="isLoading"
      persistent
      class="align-center justify-center"
      :close-on-content-click="false"
    >
      <div class="text-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
          width="5"
          class="mb-4"
        ></v-progress-circular>
        <div v-if="loadingMessage" class="text-body-1">
          {{ loadingMessage }}
        </div>
      </div>
    </v-overlay>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

// State
const showError = ref(false)
const errorMessage = ref('')
const loadingMessage = ref('Cargando...')

// Computed
const isLoading = computed(() => store.getters.isLoading)
const currentError = computed(() => store.getters.error)
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

// Watchers
watch(currentError, (newError) => {
  if (newError) {
    errorMessage.value = typeof newError === 'string' ? newError : 'Ha ocurrido un error inesperado'
    showError.value = true
  }
}, { immediate: true })

// Methods
const handleRouteChange = (to) => {
  // Reset error state on route change
  if (showError.value) {
    showError.value = false
    store.dispatch('setError', null)
  }
  
  // Update loading message based on route
  const routeMessages = {
    'dashboard': 'Cargando dashboard...',
    'campaigns': 'Cargando campañas...',
    'contacts': 'Cargando contactos...',
    'settings': 'Cargando configuración...'
  }
  
  loadingMessage.value = routeMessages[to.name] || 'Cargando...'
}

// Lifecycle hooks
onMounted(async () => {
  // Handle initial route
  handleRouteChange(route)
  
  // Set up route change watcher
  router.afterEach(handleRouteChange)
  
  // Check authentication state
  if (isAuthenticated.value) {
    try {
      loadingMessage.value = 'Verificando sesión...'
      // La verificación del token ya se hace en auth store initialization
      console.log('[App] Usuario autenticado correctamente')
    } catch (error) {
      console.error('Error al verificar autenticación:', error)
    } finally {
      loadingMessage.value = 'Cargando...'
    }
  }
})

onBeforeUnmount(() => {
  // Clean up any global event listeners if needed
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>