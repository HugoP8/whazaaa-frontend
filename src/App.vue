<template>
  <v-app>
    <router-view />
    
    <!-- Loading global -->
    <v-overlay
      :model-value="isLoading"
      persistent
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-app>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isLoading = computed(() => store.getters.isLoading)

onMounted(() => {
  // Verificar estado de autenticación al cargar
  if (store.getters['auth/isAuthenticated']) {
    store.dispatch('auth/getProfile').catch(() => {
      // Si falla, el interceptor manejará el error
    })
  }
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>