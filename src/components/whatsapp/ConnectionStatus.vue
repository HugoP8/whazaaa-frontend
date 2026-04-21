<template>
  <div class="connection-status">
    <!-- Estado principal -->
    <v-chip
      :color="statusColor"
      :prepend-icon="statusIcon"
      variant="flat"
      class="mx-2"
      @click="showDetails = !showDetails"
      style="cursor: pointer;"
    >
      {{ statusText }}
      <v-icon end size="small">
        {{ showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
      </v-icon>
    </v-chip>

    <!-- Panel de detalles expandible -->
    <v-expand-transition>
      <v-card v-if="showDetails" class="mt-2 connection-details" variant="outlined">
        <v-card-text class="pa-3">
          <!-- Información de conexión -->
          <div class="mb-3">
            <div class="text-subtitle-2 font-weight-bold mb-1">Estado de Conexión</div>
            <div class="d-flex align-center">
              <v-icon :color="statusColor" size="20" class="me-2">{{ statusIcon }}</v-icon>
              <span>{{ statusText }}</span>
              <v-spacer />
              <span v-if="connectionInfo?.user" class="text-caption text-grey">
                {{ connectionInfo.user.name }}
              </span>
            </div>
          </div>

          <!-- Error si existe -->
          <v-alert
            v-if="connectionError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <div class="text-caption">Error: {{ connectionError }}</div>
          </v-alert>

          <!-- Información adicional -->
          <div v-if="connectionInfo" class="mb-3">
            <div class="text-caption text-grey mb-1">Información de sesión:</div>
            <div class="text-caption">
              <div v-if="connectionInfo.phoneNumber">
                Teléfono: {{ connectionInfo.phoneNumber }}
              </div>
              <div v-if="lastCheckTime">
                Última verificación: {{ formatTime(lastCheckTime) }}
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="d-flex gap-2">
            <v-btn
              v-if="!isConnected && !isConnecting"
              size="small"
              color="primary"
              variant="outlined"
              @click="handleConnect"
              :loading="actionLoading"
            >
              <v-icon start>mdi-connection</v-icon>
              Conectar
            </v-btn>

            <v-btn
              v-if="isConnected"
              size="small"
              color="error"
              variant="outlined"
              @click="handleDisconnect"
              :loading="actionLoading"
            >
              <v-icon start>mdi-connection</v-icon>
              Desconectar
            </v-btn>

            <v-btn
              size="small"
              color="info"
              variant="outlined"
              @click="handleRefresh"
              :loading="refreshLoading"
            >
              <v-icon start>mdi-refresh</v-icon>
              Verificar
            </v-btn>

            <v-btn
              v-if="canReconnect"
              size="small"
              color="warning"
              variant="outlined"
              @click="handleReconnect"
              :loading="reconnectLoading"
            >
              <v-icon start>mdi-autorenew</v-icon>
              Reconectar
            </v-btn>
          </div>

          <!-- Diagnóstico rápido -->
          <div v-if="showDiagnostic" class="mt-3 pt-3" style="border-top: 1px solid rgba(0,0,0,0.1);">
            <div class="text-caption text-grey mb-2">Diagnóstico rápido:</div>
            <div class="text-caption">
              <div class="d-flex justify-space-between">
                <span>Socket conectado:</span>
                <v-icon
                  :color="socketConnected ? 'success' : 'error'"
                  size="16"
                >
                  {{ socketConnected ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </div>
              <div class="d-flex justify-space-between">
                <span>WhatsApp activo:</span>
                <v-icon
                  :color="isConnected ? 'success' : 'error'"
                  size="16"
                >
                  {{ isConnected ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()

// Estado reactivo
const showDetails = ref(false)
const showDiagnostic = ref(true)
const actionLoading = ref(false)
const refreshLoading = ref(false)
const reconnectLoading = ref(false)
const lastCheckTime = ref(null)
let statusCheckInterval = null

// Getters del store
const isConnected = computed(() => store.getters['whatsapp/isConnected'])
const isConnecting = computed(() => store.getters['whatsapp/isConnecting'])
const connectionInfo = computed(() => store.getters['whatsapp/connectionInfo'])
const connectionError = computed(() => store.getters['whatsapp/connectionError'])

// Estado computado
const statusColor = computed(() => {
  if (isConnecting.value) return 'warning'
  return isConnected.value ? 'success' : 'error'
})

const statusIcon = computed(() => {
  if (isConnecting.value) return 'mdi-loading mdi-spin'
  return isConnected.value ? 'mdi-check-circle' : 'mdi-alert-circle'
})

const statusText = computed(() => {
  if (isConnecting.value) return 'Conectando...'
  return isConnected.value ? 'Conectado' : 'Desconectado'
})

const socketConnected = computed(() => {
  const socket = store.state.whatsapp.socket
  return socket && socket.connected
})

const canReconnect = computed(() => {
  return !isConnected.value && !isConnecting.value && connectionError.value
})

// Métodos de acción
const handleConnect = async () => {
  actionLoading.value = true
  try {
    await store.dispatch('whatsapp/connect')
    toast.success('Iniciando conexión a WhatsApp')
  } catch (error) {
    console.error('[ConnectionStatus] Error conectando:', error)
    toast.error('Error al conectar WhatsApp')
  } finally {
    actionLoading.value = false
  }
}

const handleDisconnect = async () => {
  actionLoading.value = true
  try {
    await store.dispatch('whatsapp/disconnect')
    toast.info('WhatsApp desconectado')
  } catch (error) {
    console.error('[ConnectionStatus] Error desconectando:', error)
    toast.error('Error al desconectar WhatsApp')
  } finally {
    actionLoading.value = false
  }
}

const handleRefresh = async () => {
  refreshLoading.value = true
  try {
    await store.dispatch('whatsapp/checkStatus')
    lastCheckTime.value = new Date()
    toast.success('Estado verificado')
  } catch (error) {
    console.error('[ConnectionStatus] Error verificando estado:', error)
    toast.error('Error al verificar estado')
  } finally {
    refreshLoading.value = false
  }
}

const handleReconnect = async () => {
  reconnectLoading.value = true
  try {
    // Intentar detectar y reconectar automáticamente
    await store.dispatch('whatsapp/detectAndReconnect')
    toast.info('Intentando reconexión automática')
  } catch (error) {
    console.error('[ConnectionStatus] Error en reconexión:', error)
    toast.error('Error en reconexión automática')
  } finally {
    reconnectLoading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return 'N/A'
  try {
    return new Date(time).toLocaleTimeString('es-ES')
  } catch (error) {
    return 'N/A'
  }
}

// Verificación periódica del estado
const startStatusCheck = () => {
  // Verificar cada 30 segundos cuando no está conectado
  statusCheckInterval = setInterval(async () => {
    if (!isConnected.value && !isConnecting.value) {
      try {
        await store.dispatch('whatsapp/detectAndReconnect')
      } catch (error) {
        console.warn('[ConnectionStatus] Error en verificación automática:', error)
      }
    }
  }, 30000)
}

const stopStatusCheck = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
  }
}

// Escuchar eventos de socket para manejo de errores de conexión
const setupSocketErrorHandling = () => {
  const socket = store.state.whatsapp.socket
  if (socket) {
    socket.on('connection-status', (status) => {
      if (status.connected) {
        // Habilitar botones de campaña
        document.dispatchEvent(new CustomEvent('whatsapp-connected'))
      } else {
        // Mostrar aviso de conexión requerida
        document.dispatchEvent(new CustomEvent('whatsapp-disconnected'))
      }
    })
  }
}

onMounted(() => {
  // Verificar estado inicial
  store.dispatch('whatsapp/checkStatus')
    .then(() => {
      lastCheckTime.value = new Date()
    })
    .catch(error => {
      console.warn('[ConnectionStatus] Error en verificación inicial:', error)
    })

  // Iniciar verificación periódica
  startStatusCheck()

  // Configurar manejo de errores de socket
  setupSocketErrorHandling()
})

onUnmounted(() => {
  stopStatusCheck()
})
</script>

<style scoped>
.connection-status {
  position: relative;
}

.connection-details {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gap-2 {
  gap: 8px;
}

@media (max-width: 600px) {
  .connection-details {
    min-width: 280px;
  }

  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
}
</style>