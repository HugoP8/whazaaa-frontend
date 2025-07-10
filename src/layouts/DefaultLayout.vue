<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      color="primary"
      dark
      elevation="2"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="d-lg-none"
      ></v-app-bar-nav-icon>
      
      <v-toolbar-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-whatsapp</v-icon>
        <span class="font-weight-bold">WhatsApp Mass Sender</span>
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Estado de conexión -->
      <connection-status />
      
      <v-menu
        offset-y
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-avatar size="40">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ currentUser?.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ currentUser?.email }}</v-list-item-subtitle>
          </v-list-item>
          
          <v-divider></v-divider>
          
          <v-list-item
            @click="$router.push('/settings')"
            prepend-icon="mdi-cog"
          >
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item>
          
          <v-list-item
            @click="logout"
            prepend-icon="mdi-logout"
          >
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    
    <!-- Navigation Drawer -->
    <navigation-drawer v-model="drawer" />
    
    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </v-container>
    </v-main>
    
    <!-- Footer -->
    <app-footer />
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue'
import AppFooter from '@/components/layout/Footer.vue'
import ConnectionStatus from '@/components/whatsapp/ConnectionStatus.vue'

const store = useStore()
const drawer = ref(true)

const currentUser = computed(() => store.getters['auth/currentUser'])

const logout = () => {
  store.dispatch('auth/logout')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>