<!-- src/components/whatsapp/QRCode.vue -->
<template>
  <div class="text-center">
    <v-card elevation="2" rounded="xl" class="qr-container">
      <v-card-title class="justify-center">
        <v-icon large color="green" class="mr-2">mdi-whatsapp</v-icon>
        Conectar WhatsApp
      </v-card-title>
      
      <v-card-text>
        <!-- QR Code mostrado -->
        <div v-if="qrCode && !isConnected" key="qr-display">
          <p class="mb-4 text-body-1">Escanea este código con la aplicación de WhatsApp:</p>
          <div class="qr-wrapper">
            <img 
              :src="qrCode" 
              alt="WhatsApp QR Code" 
              class="qr-code"
              @error="onImageError"
              @load="onImageLoad"
            >
            <div class="qr-overlay" v-if="loading">
              <v-progress-circular 
                indeterminate 
                color="green" 
                size="48"
              ></v-progress-circular>
            </div>
          </div>
          <p class="mt-4 text-caption text-grey">
            Ve a WhatsApp > Ajustes > Dispositivos vinculados > Vincular un dispositivo
          </p>
          <p class="mt-2 text-caption text-orange">
            El código QR expira cada 20 segundos. Escanéalo rápidamente.
          </p>
          
          <!-- Botones de acción -->
          <div class="mt-4">
            <v-btn 
              color="primary" 
              variant="outlined" 
              class="mr-2" 
              @click="regenerateQR"
              :loading="connecting"
              size="small"
            >
              <v-icon left>mdi-refresh</v-icon>
              Regenerar QR
            </v-btn>
            
            <v-btn 
              color="red" 
              variant="outlined" 
              @click="cancelConnection"
              :disabled="connecting"
              size="small"
            >
              <v-icon left>mdi-close</v-icon>
              Cancelar
            </v-btn>
          </div>
        </div>
        
        <!-- Estado de carga inicial -->
        <div v-else-if="connecting && !qrCode && !isConnected" key="loading">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-body-1">Generando código QR...</p>
          <p class="text-caption text-grey mt-2">Esto puede tomar unos segundos</p>
          
          <v-btn 
            color="red" 
            variant="text" 
            class="mt-3" 
            @click="cancelConnection"
          >
            Cancelar
          </v-btn>
        </div>
        
        <!-- Conectado exitosamente -->
        <div v-else-if="isConnected" key="connected">
          <v-icon size="64" color="green" class="success-icon">mdi-check-circle</v-icon>
          <p class="mt-4 text-h6 text-green">¡WhatsApp Conectado Exitosamente!</p>
          
          <!-- Información del usuario autenticado -->
          <v-card 
            v-if="connectionInfo" 
            class="mt-4 mx-auto"
            max-width="400"
            elevation="2"
            color="green-lighten-5"
            rounded="xl"
          >
            <v-card-text class="text-center">
              <v-avatar color="green" size="48" class="mb-3">
                <v-icon color="white" size="24">mdi-account</v-icon>
              </v-avatar>
              <p class="text-h6 text-green-darken-2 mb-2">
                {{ connectionInfo.name || 'Usuario de WhatsApp' }}
              </p>
              <p class="text-body-2 text-green-darken-1" v-if="connectionInfo.phone">
                <v-icon size="16" class="mr-1">mdi-phone</v-icon>
                {{ connectionInfo.phone }}
              </p>
              <p class="text-body-2 text-green-darken-1" v-if="connectionInfo.id">
                <v-icon size="16" class="mr-1">mdi-identifier</v-icon>
                ID: {{ connectionInfo.id.split(':')[0] }}
              </p>
              <v-chip 
                color="green" 
                size="small" 
                class="mt-2"
                prepend-icon="mdi-check-circle"
              >
                Autenticado
              </v-chip>
            </v-card-text>
          </v-card>
          
          <!-- Fallback si no hay información del usuario -->
          <v-alert
            v-else
            type="success"
            variant="tonal"
            class="mt-4"
          >
            <strong>Estado:</strong> Conectado y listo para enviar mensajes
          </v-alert>
          
          <div class="mt-4">
            <v-btn 
              color="green" 
              variant="elevated"
              class="mr-2"
              @click="goToCampaigns"
            >
              <v-icon left>mdi-send</v-icon>
              Crear Campaña
            </v-btn>
            
            <v-btn 
              color="red" 
              variant="outlined" 
              @click="disconnect"
              :loading="disconnecting"
            >
              <v-icon left>mdi-logout</v-icon>
              Desconectar
            </v-btn>
          </div>
        </div>
        
        <!-- Error -->
        <div v-else-if="error" key="error">
          <v-icon size="64" color="red">mdi-alert-circle</v-icon>
          <v-alert type="error" class="my-4" variant="tonal">
            <strong>Error de conexión:</strong><br>
            {{ error }}
          </v-alert>
          
          <div class="mt-4">
            <v-btn 
              color="primary" 
              @click="retry" 
              :loading="connecting"
              class="mr-2"
            >
              <v-icon left>mdi-refresh</v-icon>
              Reintentar
            </v-btn>
            
            <v-btn 
              color="grey" 
              variant="outlined"
              @click="clearError"
            >
              Cerrar Error
            </v-btn>
          </div>
        </div>
        
        <!-- Estado inicial -->
        <div v-else key="initial">
          <v-icon size="64" color="grey-lighten-1">mdi-qrcode</v-icon>
          <p class="mt-4 text-body-1">Conecta tu WhatsApp para enviar mensajes masivos</p>
          <p class="text-body-2 text-grey mt-2">
            Presiona el botón para generar un código QR y vincular tu cuenta
          </p>
          
          <div class="mt-4">
            <v-btn 
              color="green" 
              @click="connect"
              :loading="connecting"
              size="large"
              elevation="2"
              class="mr-2"
            >
              <v-icon left>mdi-whatsapp</v-icon>
              Conectar WhatsApp
            </v-btn>
            
            <v-btn 
              color="blue" 
              variant="outlined"
              @click="checkConnectionStatus"
              :loading="checkingStatus"
              size="large"
            >
              <v-icon left>mdi-refresh</v-icon>
              Verificar Estado
            </v-btn>
          </div>
        </div>
      </v-card-text>
      
      <!-- Información de estado del socket -->
      <v-card-actions v-if="showDebug">
        <v-spacer></v-spacer>
        <v-chip 
          :color="socketConnected ? 'green' : 'red'" 
          size="small" 
          variant="outlined"
        >
          <v-icon start>
            {{ socketConnected ? 'mdi-check-network' : 'mdi-network-off' }}
          </v-icon>
          {{ socketConnected ? 'Socket OK' : 'Socket Error' }}
        </v-chip>
      </v-card-actions>
      
      <!-- Debug info (solo en desarrollo) -->
      <v-expansion-panels v-if="showDebug" variant="accordion" class="debug-panel">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon left>mdi-bug</v-icon>
            Debug Info
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="debug-info">
              <p><strong>Estado:</strong></p>
              <ul class="mb-2">
                <li>Conectado: {{ isConnected }}</li>
                <li>Conectando: {{ connecting }}</li>
                <li>QR presente: {{ !!qrCode }}</li>
                <li>Error: {{ error || 'Ninguno' }}</li>
              </ul>
              
              <p><strong>Socket:</strong></p>
              <ul class="mb-2">
                <li>Conectado: {{ socketConnected }}</li>
                <li>Usuario ID: {{ userId || 'No definido' }}</li>
              </ul>
              
              <p><strong>Conexión Info:</strong></p>
              <pre>{{ JSON.stringify(connectionInfo, null, 2) }}</pre>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
    
    <!-- Indicador de conexión perdida -->
    <v-snackbar
      v-model="showSocketError"
      color="warning"
      timeout="0"
      location="bottom"
      multi-line
    >
      <v-icon left>mdi-wifi-off</v-icon>
      Conexión con el servidor perdida. Intentando reconectar...
      
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSocketError = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { whatsappService } from '@/services/whatsappService'

const store = useStore()
const router = useRouter()

// Estados locales
const loading = ref(false)
const disconnecting = ref(false)
const showSocketError = ref(false)
const socketConnected = ref(false)
const checkingStatus = ref(false)

// Computed properties
const qrCode = computed(() => store.getters['whatsapp/qrCode'])
const connecting = computed(() => store.getters['whatsapp/isConnecting'])
const isConnected = computed(() => store.getters['whatsapp/isConnected'])
const error = computed(() => store.getters['whatsapp/connectionError'])
const connectionInfo = computed(() => store.getters['whatsapp/connectionInfo'])
const userId = computed(() => store.getters['auth/userId'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

// Debug mode
const showDebug = computed(() => {
  return import.meta.env.MODE === 'development'
})

// Methods
const connect = async () => {
  if (!isAuthenticated.value) {
    console.error('[QRCode] Usuario no autenticado')
    return
  }
  
  console.log('[QRCode] Iniciando conexión...')
  loading.value = true
  
  try {
    await store.dispatch('whatsapp/connect')
    
    // Verificar si ya está conectado después del intento de conexión
    if (isConnected.value) {
      console.log('[QRCode] ✅ Usuario ya conectado, ocultando QR')
      loading.value = false
      return
    }
  } catch (error) {
    console.error('[QRCode] Error al conectar:', error)
  } finally {
    setTimeout(() => {
      loading.value = false
    }, 3000) // Dar tiempo para que aparezca el QR
  }
}

const retry = async () => {
  console.log('[QRCode] Reintentando conexión...')
  await connect()
}

const regenerateQR = async () => {
  console.log('[QRCode] Regenerando QR...')
  await retry()
}

const disconnect = async () => {
  console.log('[QRCode] Desconectando...')
  disconnecting.value = true
  try {
    await store.dispatch('whatsapp/disconnect')
  } catch (error) {
    console.error('[QRCode] Error al desconectar:', error)
  } finally {
    disconnecting.value = false
  }
}

const cancelConnection = async () => {
  console.log('[QRCode] Cancelando conexión...')
  try {
    await store.dispatch('whatsapp/disconnect')
  } catch (error) {
    console.error('[QRCode] Error cancelando conexión:', error)
  }
}

const clearError = () => {
  console.log('[QRCode] Limpiando error...')
  // Si tienes una acción para limpiar errores en el store
  // store.dispatch('whatsapp/clearError')
}

const goToCampaigns = () => {
  router.push('/campaigns/new')
}

const onImageError = (event) => {
  console.error('[QRCode] Error cargando imagen QR:', event)
  console.log('[QRCode] QR Code actual:', qrCode.value)
  
  // Si la imagen no carga, intentar regenerar el QR
  setTimeout(() => {
    console.log('[QRCode] Reintentando carga de QR por error de imagen...')
    regenerateQR()
  }, 2000)
}

const onImageLoad = () => {
  console.log('[QRCode] QR Code cargado exitosamente')
}

// Función para verificar manualmente el estado de conexión
const checkConnectionStatus = async () => {
  console.log('[QRCode] 🔍 Verificando estado de conexión manualmente...')
  checkingStatus.value = true
  
  try {
    // Usar la función mejorada de detección y reconexión
    const connected = await store.dispatch('whatsapp/detectAndReconnect')
    
    if (connected) {
      console.log('[QRCode] ✅ ¡Conexión verificada y sincronizada!')
    } else {
      console.log('[QRCode] ❌ No se encontró conexión activa - es necesario escanear QR')
      
      // Si no hay conexión, intentar iniciar nueva conexión
      if (!connecting.value && !qrCode.value) {
        console.log('[QRCode] Iniciando nueva conexión...')
        await connect()
      }
    }
  } catch (error) {
    console.error('[QRCode] Error verificando estado:', error)
  } finally {
    checkingStatus.value = false
  }
}

// Monitorear conexión del socket (simplificado para evitar loops)
const monitorSocket = () => {
  const updateSocketStatus = () => {
    const serviceInfo = whatsappService.getSocketInfo()
    socketConnected.value = serviceInfo.connected
    
    if (!serviceInfo.connected && isConnected.value) {
      showSocketError.value = true
    } else {
      showSocketError.value = false
    }
  }
  
  // Verificar cada 5 segundos (menos frecuente para evitar spam)
  const interval = setInterval(updateSocketStatus, 5000)
  updateSocketStatus() // Verificar inmediatamente
  
  return interval
}

// Watch para detectar cambios en la conexión
watch(isConnected, (newValue, oldValue) => {
  console.log('[QRCode] Estado de conexión cambió:', { old: oldValue, new: newValue })
  
  if (newValue) {
    showSocketError.value = false
    console.log('[QRCode] ✅ WhatsApp conectado exitosamente!')
  }
})

// Watch para detectar cuando aparece el QR y agregar timeout
watch(qrCode, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    console.log('[QRCode] QR Code apareció - iniciando timeout de 30 segundos')
    
    // QR válido por 30 segundos, luego regenerar automáticamente
    setTimeout(() => {
      if (qrCode.value && !isConnected.value) {
        console.log('[QRCode] QR expirado después de 30 segundos - regenerando...')
        regenerateQR()
      }
    }, 30000) // 30 segundos
  }
})

// Lifecycle
let socketMonitorInterval = null

onMounted(async () => {
  console.log('[QRCode] Componente montado')
  
  if (!isAuthenticated.value) {
    console.warn('[QRCode] Usuario no autenticado, redirigiendo a login')
    router.push('/login')
    return
  }
  
  // Iniciar monitoreo del socket
  socketMonitorInterval = monitorSocket()
  
  // Verificar estado actual de WhatsApp
  try {
    await store.dispatch('whatsapp/checkStatus')
    console.log('[QRCode] Estado verificado exitosamente')
  } catch (error) {
    console.error('[QRCode] Error verificando estado:', error)
  }
})

onUnmounted(() => {
  console.log('[QRCode] Componente desmontado')
  
  // Limpiar intervalo de monitoreo
  if (socketMonitorInterval) {
    clearInterval(socketMonitorInterval)
  }
})
</script>

<style scoped>
.qr-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  position: relative;
}

.qr-code {
  max-width: 300px;
  width: 100%;
  height: auto;
  margin: 0 auto;
  display: block;
  border: 2px solid #e0e0e0;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  animation: qrPulse 2s ease-in-out infinite;
}

.qr-code:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.qr-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 10px;
}

.success-icon {
  animation: successPulse 1s ease-out;
}

@keyframes qrPulse {
  0%, 100% { 
    border-color: #e0e0e0; 
  }
  50% { 
    border-color: #4caf50; 
  }
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.debug-panel {
  margin-top: 10px;
}

.debug-info {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.debug-info ul {
  list-style: none;
  padding: 0;
}

.debug-info li {
  margin-bottom: 4px;
}

.debug-info pre {
  font-size: 11px;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.text-green {
  color: #4caf50 !important;
}

.text-orange {
  color: #ff9800 !important;
}

/* Animaciones suaves entre estados */
.v-enter-active, .v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from, .v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>