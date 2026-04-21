<template>
  <v-container>
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="bg-primary text-white">
        🔍 Debug Admin - Estado del Sistema
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Usuario Actual -->
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="text-h6 mb-2">👤 Usuario Actual</div>
          <pre>{{ user }}</pre>
        </v-alert>

        <!-- Role -->
        <v-alert
          :type="user?.role ? 'success' : 'error'"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6 mb-2">🎭 Role</div>
          <div class="text-h5">{{ user?.role || 'NO DEFINIDO' }}</div>
        </v-alert>

        <!-- isAdmin -->
        <v-alert
          :type="isAdmin ? 'success' : 'error'"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6 mb-2">🔐 isAdmin</div>
          <div class="text-h4 font-weight-bold">{{ isAdmin ? '✅ TRUE' : '❌ FALSE' }}</div>
        </v-alert>

        <!-- isAuthenticated -->
        <v-alert
          :type="isAuthenticated ? 'success' : 'error'"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6 mb-2">🔑 isAuthenticated</div>
          <div class="text-h4 font-weight-bold">{{ isAuthenticated ? '✅ TRUE' : '❌ FALSE' }}</div>
        </v-alert>

        <!-- localStorage -->
        <v-alert type="warning" variant="tonal" class="mb-4">
          <div class="text-h6 mb-2">💾 localStorage</div>
          <div><strong>Token:</strong> {{ hasToken ? '✅ Presente' : '❌ No presente' }}</div>
          <div class="mt-2"><strong>User:</strong></div>
          <pre style="max-height: 200px; overflow: auto;">{{ storedUser }}</pre>
        </v-alert>

        <!-- Diagnóstico -->
        <v-alert
          :type="diagnosticType"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-h6 mb-2">🎯 Diagnóstico</div>
          <div v-html="diagnosticMessage"></div>
        </v-alert>

        <!-- Acciones -->
        <div class="d-flex gap-2 flex-wrap">
          <v-btn color="primary" @click="refreshData">
            🔄 Actualizar
          </v-btn>
          <v-btn color="warning" @click="clearAndReload">
            🗑️ Limpiar localStorage
          </v-btn>
          <v-btn
            v-if="isAdmin"
            color="purple"
            @click="goToAdmin"
          >
            🔐 Ir a Panel Admin
          </v-btn>
          <v-btn color="success" @click="testLogin">
            🧪 Test Login Admin
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// Computed properties
const user = computed(() => store.getters['auth/user'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const isAdmin = computed(() => store.getters['auth/isAdmin'])

const hasToken = computed(() => !!localStorage.getItem('token'))

const storedUser = computed(() => {
  const stored = localStorage.getItem('user')
  if (!stored) return 'No hay usuario en localStorage'
  try {
    return JSON.stringify(JSON.parse(stored), null, 2)
  } catch (e) {
    return stored
  }
})

const diagnosticType = computed(() => {
  if (!isAuthenticated.value) return 'error'
  if (!user.value?.role) return 'error'
  if (isAdmin.value) return 'success'
  return 'warning'
})

const diagnosticMessage = computed(() => {
  if (!isAuthenticated.value) {
    return '<strong>❌ NO AUTENTICADO</strong><br>Debes hacer login primero'
  }

  if (!user.value?.role) {
    return '<strong>❌ CAMPO ROLE NO EXISTE</strong><br>' +
           'El usuario no tiene el campo "role".<br>' +
           'Backend no está enviando el role o no se guardó correctamente.<br><br>' +
           '<strong>Solución:</strong> Cerrar sesión y volver a hacer login.'
  }

  const role = user.value.role

  if (role === 'admin' || role === 'superadmin') {
    if (isAdmin.value) {
      return '<strong>✅ TODO CORRECTO</strong><br>' +
             `Usuario con role "${role}" detectado correctamente.<br>` +
             'isAdmin es TRUE.<br>' +
             '¡El Panel Admin DEBE ser visible!'
    } else {
      return '<strong>⚠️ PROBLEMA DETECTADO</strong><br>' +
             `El usuario tiene role="${role}" pero isAdmin es FALSE.<br>` +
             'Hay un problema con el getter isAdmin del store.<br><br>' +
             '<strong>Solución:</strong> Revisar src/store/modules/auth.js'
    }
  } else {
    return '<strong>ℹ️ USUARIO NORMAL</strong><br>' +
           `Role: "${role}"<br>` +
           'Este usuario NO es admin.<br>' +
           'El panel admin no debe ser visible.'
  }
})

// Methods
const refreshData = () => {
  console.log('=== REFRESH DATA ===')
  console.log('User:', user.value)
  console.log('Role:', user.value?.role)
  console.log('isAdmin:', isAdmin.value)
  console.log('isAuthenticated:', isAuthenticated.value)
  console.log('localStorage user:', localStorage.getItem('user'))
  console.log('localStorage token:', localStorage.getItem('token'))

  // Forzar re-evaluación
  store.dispatch('auth/verifyToken').catch(() => {
    console.log('Token inválido o expirado')
  })
}

const clearAndReload = () => {
  if (confirm('¿Limpiar localStorage y recargar?')) {
    localStorage.clear()
    location.reload()
  }
}

const goToAdmin = () => {
  router.push('/admin')
}

const testLogin = async () => {
  // Simular login con credenciales admin
  try {
    await store.dispatch('auth/login', {
      email: 'admin@whazaaa.com',
      password: 'password123'
    })

    setTimeout(() => {
      refreshData()
    }, 1000)
  } catch (error) {
    console.error('Error en login:', error)
    alert('Error en login: ' + error.message)
  }
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.gap-2 {
  gap: 8px;
}
</style>
