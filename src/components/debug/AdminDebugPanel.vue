<template>
  <v-card v-if="showDebug" color="yellow-lighten-4" class="debug-panel" elevation="8">
    <v-card-title class="bg-yellow-darken-2 text-white">
      🔍 Panel de Depuración Admin
      <v-btn
        icon
        size="small"
        variant="text"
        class="ml-2"
        @click="showDebug = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row>
        <v-col cols="12" md="6">
          <h3 class="text-h6 mb-2">👤 Usuario</h3>
          <div class="debug-info">
            <div><strong>Email:</strong> {{ user?.email || 'No definido' }}</div>
            <div><strong>Name:</strong> {{ user?.name || 'No definido' }}</div>
            <div><strong>ID:</strong> {{ user?.id || 'No definido' }}</div>
            <div class="mt-2">
              <strong>Role:</strong>
              <v-chip
                :color="getRoleColor(user?.role)"
                size="small"
                class="ml-2"
              >
                {{ user?.role || 'NO HAY ROLE' }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <h3 class="text-h6 mb-2">🔐 Estado de Permisos</h3>
          <div class="debug-info">
            <div>
              <strong>isAuthenticated:</strong>
              <v-chip
                :color="isAuthenticated ? 'success' : 'error'"
                size="small"
                class="ml-2"
              >
                {{ isAuthenticated ? '✅ true' : '❌ false' }}
              </v-chip>
            </div>

            <div class="mt-2">
              <strong>isAdmin:</strong>
              <v-chip
                :color="isAdmin ? 'success' : 'error'"
                size="small"
                class="ml-2"
              >
                {{ isAdmin ? '✅ true' : '❌ false' }}
              </v-chip>
            </div>

            <div class="mt-2">
              <strong>isSuperAdmin:</strong>
              <v-chip
                :color="isSuperAdmin ? 'purple' : 'grey'"
                size="small"
                class="ml-2"
              >
                {{ isSuperAdmin ? '✅ true' : '❌ false' }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <h3 class="text-h6 mb-2">📦 localStorage</h3>
          <div class="debug-info">
            <div>
              <strong>Token presente:</strong>
              <v-chip
                :color="hasToken ? 'success' : 'error'"
                size="small"
                class="ml-2"
              >
                {{ hasToken ? '✅ SÍ' : '❌ NO' }}
              </v-chip>
            </div>

            <div class="mt-2">
              <strong>User almacenado:</strong>
              <pre class="mt-2 pa-2 bg-grey-lighten-3" style="font-size: 11px; max-height: 150px; overflow: auto;">{{ storedUser }}</pre>
            </div>
          </div>
        </v-col>

        <v-col cols="12">
          <v-alert
            v-if="!isAdmin && user?.role"
            type="error"
            variant="tonal"
          >
            ⚠️ <strong>PROBLEMA DETECTADO:</strong> El usuario tiene role "{{ user.role }}" pero isAdmin es false.
            El panel admin NO será visible.
          </v-alert>

          <v-alert
            v-if="isAdmin"
            type="success"
            variant="tonal"
          >
            ✅ <strong>TODO CORRECTO:</strong> El usuario es admin. El panel admin DEBE ser visible.
          </v-alert>

          <v-alert
            v-if="!user?.role"
            type="warning"
            variant="tonal"
          >
            ⚠️ <strong>ADVERTENCIA:</strong> No hay campo "role" en el usuario. Verifica el backend.
          </v-alert>
        </v-col>

        <v-col cols="12">
          <v-btn
            color="primary"
            size="small"
            @click="refreshData"
          >
            🔄 Actualizar
          </v-btn>

          <v-btn
            color="warning"
            size="small"
            class="ml-2"
            @click="clearAndReload"
          >
            🗑️ Limpiar y Recargar
          </v-btn>

          <v-btn
            v-if="isAdmin"
            color="purple"
            size="small"
            class="ml-2"
            @click="goToAdmin"
          >
            🔐 Ir a Panel Admin
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- Toggle Button -->
  <v-btn
    v-else
    color="yellow-darken-2"
    size="small"
    variant="elevated"
    style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
    @click="showDebug = true"
  >
    🔍 Debug
  </v-btn>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const showDebug = ref(true)

// Computed
const user = computed(() => store.getters['auth/user'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const isAdmin = computed(() => store.getters['auth/isAdmin'])
const isSuperAdmin = computed(() => store.getters['auth/isSuperAdmin'])

const hasToken = computed(() => {
  return !!localStorage.getItem('token')
})

const storedUser = computed(() => {
  const stored = localStorage.getItem('user')
  if (!stored) return 'No hay usuario en localStorage'
  try {
    return JSON.stringify(JSON.parse(stored), null, 2)
  } catch (e) {
    return stored
  }
})

// Methods
const getRoleColor = (role) => {
  const colors = {
    superadmin: 'purple',
    admin: 'orange',
    user: 'blue'
  }
  return colors[role] || 'grey'
}

const refreshData = () => {
  console.log('=== REFRESH DATA ===')
  console.log('User:', user.value)
  console.log('Role:', user.value?.role)
  console.log('isAdmin:', isAdmin.value)
  console.log('isSuperAdmin:', isSuperAdmin.value)
  console.log('localStorage user:', localStorage.getItem('user'))
  console.log('localStorage token:', localStorage.getItem('token'))
}

const clearAndReload = () => {
  if (confirm('¿Limpiar localStorage y recargar la página?')) {
    localStorage.clear()
    location.reload()
  }
}

const goToAdmin = () => {
  router.push('/admin')
}
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  max-width: 800px;
  z-index: 9999;
  max-height: 80vh;
  overflow-y: auto;
}

.debug-info {
  font-size: 13px;
  line-height: 1.8;
}

.debug-info > div {
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

@media (max-width: 768px) {
  .debug-panel {
    left: 10px;
    right: 10px;
    bottom: 10px;
    max-width: none;
  }
}
</style>
