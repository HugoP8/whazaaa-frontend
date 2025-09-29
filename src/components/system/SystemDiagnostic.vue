<template>
  <div class="system-diagnostic">
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon class="me-2" color="info">mdi-doctor</v-icon>
          Diagnóstico del Sistema
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          @click="runDiagnostic"
          :loading="loading"
          :disabled="loading"
        >
          <v-icon start>mdi-refresh</v-icon>
          {{ loading ? 'Ejecutando...' : 'Ejecutar Diagnóstico' }}
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="diagnosticData">
          <!-- Estado general del sistema -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">
              <v-icon class="me-2">mdi-gauge</v-icon>
              Estado General
            </h3>
            <v-alert
              :type="getSystemHealthType()"
              variant="tonal"
              class="mb-4"
            >
              <v-icon start>{{ getSystemHealthIcon() }}</v-icon>
              {{ getSystemHealthMessage() }}
            </v-alert>

            <v-row>
              <v-col v-for="status in systemStatus" :key="status.key" cols="12" sm="6" md="3">
                <v-card variant="outlined" class="text-center pa-3">
                  <v-icon
                    :color="status.status === 'healthy' ? 'success' : 'error'"
                    size="32"
                    class="mb-2"
                  >
                    {{ status.icon }}
                  </v-icon>
                  <div class="text-subtitle-2 font-weight-bold">{{ status.name }}</div>
                  <v-chip
                    :color="status.status === 'healthy' ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                    class="mt-1"
                  >
                    {{ status.status === 'healthy' ? 'Saludable' : 'Error' }}
                  </v-chip>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Conexiones -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">
              <v-icon class="me-2">mdi-connection</v-icon>
              Conexiones
            </h3>
            <v-list>
              <v-list-item
                v-for="connection in connections"
                :key="connection.name"
                class="pa-0 mb-2"
              >
                <template v-slot:prepend>
                  <v-avatar :color="connection.connected ? 'success' : 'error'" size="40">
                    <v-icon color="white">{{ connection.icon }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ connection.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ connection.description }}
                  <span v-if="connection.lastCheck" class="text-caption">
                    (Última verificación: {{ formatTime(connection.lastCheck) }})
                  </span>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip
                    :color="connection.connected ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                  >
                    {{ connection.connected ? 'Conectado' : 'Desconectado' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <!-- Métricas del sistema -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Métricas del Sistema
            </h3>
            <v-row>
              <v-col v-for="metric in systemMetrics" :key="metric.key" cols="12" sm="6" md="4">
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-2">{{ metric.label }}</span>
                    <v-icon :color="metric.color">{{ metric.icon }}</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold" :class="`text-${metric.color}`">
                    {{ metric.value }}
                  </div>
                  <div v-if="metric.description" class="text-caption text-grey">
                    {{ metric.description }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Información de versiones -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3">
              <v-icon class="me-2">mdi-information</v-icon>
              Información del Sistema
            </h3>
            <v-table density="compact">
              <tbody>
                <tr v-for="info in systemInfo" :key="info.key">
                  <td class="font-weight-bold">{{ info.label }}</td>
                  <td>{{ info.value }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Logs recientes (si están disponibles) -->
          <div v-if="recentLogs && recentLogs.length > 0" class="mb-6">
            <h3 class="text-h6 mb-3">
              <v-icon class="me-2">mdi-text-box</v-icon>
              Logs Recientes
            </h3>
            <v-card variant="outlined">
              <v-card-text class="pa-0">
                <div class="log-container" style="max-height: 300px; overflow-y: auto;">
                  <div
                    v-for="(log, index) in recentLogs"
                    :key="index"
                    class="log-entry pa-2"
                    :class="`log-${log.level}`"
                  >
                    <div class="d-flex align-center">
                      <v-chip
                        :color="getLogLevelColor(log.level)"
                        size="x-small"
                        variant="flat"
                        class="me-2"
                      >
                        {{ log.level.toUpperCase() }}
                      </v-chip>
                      <span class="text-caption text-grey me-2">
                        {{ formatTime(log.timestamp) }}
                      </span>
                      <span class="text-body-2">{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Estado de carga -->
        <div v-else-if="loading" class="text-center py-8">
          <v-progress-circular size="64" indeterminate color="primary" />
          <div class="mt-4 text-h6">Ejecutando diagnóstico...</div>
          <div class="text-caption text-grey">
            Verificando estado del sistema y conexiones
          </div>
        </div>

        <!-- Estado inicial -->
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-doctor</v-icon>
          <div class="mt-4 text-h6">Diagnóstico del Sistema</div>
          <div class="text-body-1 text-grey mb-4">
            Ejecuta un diagnóstico completo para verificar el estado del sistema
          </div>
          <v-btn color="primary" @click="runDiagnostic">
            <v-icon start>mdi-play</v-icon>
            Ejecutar Diagnóstico
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { whatsappService } from '@/services/whatsappService'
import { useToast } from 'vue-toastification'

export default {
  name: 'SystemDiagnostic',

  setup() {
    const toast = useToast()
    const loading = ref(false)
    const diagnosticData = ref(null)

    const runDiagnostic = async () => {
      loading.value = true
      try {
        console.log('[SystemDiagnostic] Ejecutando diagnóstico...')
        const response = await whatsappService.getDiagnostic()
        diagnosticData.value = response.data || response
        console.log('[SystemDiagnostic] Diagnóstico completado:', diagnosticData.value)
        toast.success('Diagnóstico completado exitosamente')
      } catch (error) {
        console.error('[SystemDiagnostic] Error ejecutando diagnóstico:', error)
        toast.error('Error al ejecutar el diagnóstico')
        // Mostrar datos de fallback para debugging
        diagnosticData.value = {
          systemHealth: 'degraded',
          connections: [],
          metrics: {},
          systemInfo: {},
          logs: []
        }
      } finally {
        loading.value = false
      }
    }

    const systemStatus = computed(() => {
      if (!diagnosticData.value) return []

      const health = diagnosticData.value.systemHealth || {}
      return [
        {
          key: 'whatsapp',
          name: 'WhatsApp',
          status: health.whatsapp || 'error',
          icon: 'mdi-whatsapp'
        },
        {
          key: 'database',
          name: 'Base de Datos',
          status: health.database || 'error',
          icon: 'mdi-database'
        },
        {
          key: 'socket',
          name: 'Socket.IO',
          status: health.socket || 'error',
          icon: 'mdi-lan-connect'
        },
        {
          key: 'api',
          name: 'API',
          status: health.api || 'error',
          icon: 'mdi-api'
        }
      ]
    })

    const connections = computed(() => {
      if (!diagnosticData.value?.connections) return []

      return diagnosticData.value.connections.map(conn => ({
        name: conn.name || 'Conexión',
        description: conn.description || '',
        connected: conn.status === 'connected',
        icon: conn.icon || 'mdi-connection',
        lastCheck: conn.lastCheck
      }))
    })

    const systemMetrics = computed(() => {
      if (!diagnosticData.value?.metrics) return []

      const metrics = diagnosticData.value.metrics
      return [
        {
          key: 'uptime',
          label: 'Tiempo Activo',
          value: formatUptime(metrics.uptime),
          icon: 'mdi-clock',
          color: 'primary'
        },
        {
          key: 'memoryUsage',
          label: 'Uso de Memoria',
          value: formatMemory(metrics.memoryUsage),
          icon: 'mdi-memory',
          color: getMemoryColor(metrics.memoryUsage)
        },
        {
          key: 'activeConnections',
          label: 'Conexiones Activas',
          value: metrics.activeConnections || 0,
          icon: 'mdi-account-network',
          color: 'success'
        },
        {
          key: 'queueSize',
          label: 'Cola de Mensajes',
          value: metrics.queueSize || 0,
          icon: 'mdi-queue-first-in-last-out',
          color: getQueueColor(metrics.queueSize)
        }
      ]
    })

    const systemInfo = computed(() => {
      if (!diagnosticData.value?.systemInfo) return []

      const info = diagnosticData.value.systemInfo
      return [
        { key: 'version', label: 'Versión', value: info.version || 'N/A' },
        { key: 'nodeVersion', label: 'Node.js', value: info.nodeVersion || 'N/A' },
        { key: 'platform', label: 'Plataforma', value: info.platform || 'N/A' },
        { key: 'environment', label: 'Entorno', value: info.environment || 'N/A' },
        { key: 'startTime', label: 'Inicio', value: formatTime(info.startTime) || 'N/A' }
      ]
    })

    const recentLogs = computed(() => {
      return diagnosticData.value?.logs || []
    })

    const getSystemHealthType = () => {
      if (!diagnosticData.value) return 'info'

      const health = diagnosticData.value.systemHealth
      if (health === 'healthy') return 'success'
      if (health === 'degraded') return 'warning'
      return 'error'
    }

    const getSystemHealthIcon = () => {
      const type = getSystemHealthType()
      if (type === 'success') return 'mdi-check-circle'
      if (type === 'warning') return 'mdi-alert'
      return 'mdi-alert-circle'
    }

    const getSystemHealthMessage = () => {
      const type = getSystemHealthType()
      if (type === 'success') return 'Sistema funcionando correctamente'
      if (type === 'warning') return 'Sistema funcionando con advertencias'
      return 'Sistema con errores críticos'
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return 'N/A'
      try {
        return new Date(timestamp).toLocaleString('es-ES')
      } catch (error) {
        return timestamp
      }
    }

    const formatUptime = (seconds) => {
      if (!seconds) return 'N/A'

      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)

      if (days > 0) return `${days}d ${hours}h ${minutes}m`
      if (hours > 0) return `${hours}h ${minutes}m`
      return `${minutes}m`
    }

    const formatMemory = (bytes) => {
      if (!bytes) return 'N/A'

      const mb = bytes / (1024 * 1024)
      return `${Math.round(mb)} MB`
    }

    const getMemoryColor = (bytes) => {
      if (!bytes) return 'grey'

      const mb = bytes / (1024 * 1024)
      if (mb > 500) return 'error'
      if (mb > 250) return 'warning'
      return 'success'
    }

    const getQueueColor = (size) => {
      if (!size || size === 0) return 'success'
      if (size > 100) return 'error'
      if (size > 50) return 'warning'
      return 'info'
    }

    const getLogLevelColor = (level) => {
      switch (level?.toLowerCase()) {
        case 'error': return 'error'
        case 'warn': case 'warning': return 'warning'
        case 'info': return 'info'
        case 'debug': return 'grey'
        default: return 'primary'
      }
    }

    return {
      loading,
      diagnosticData,
      systemStatus,
      connections,
      systemMetrics,
      systemInfo,
      recentLogs,
      runDiagnostic,
      getSystemHealthType,
      getSystemHealthIcon,
      getSystemHealthMessage,
      formatTime,
      getLogLevelColor
    }
  }
}
</script>

<style scoped>
.system-diagnostic {
  width: 100%;
}

.log-container {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-error {
  background-color: rgba(244, 67, 54, 0.05);
}

.log-warn {
  background-color: rgba(255, 152, 0, 0.05);
}

.log-info {
  background-color: rgba(33, 150, 243, 0.05);
}

.v-table tbody td {
  padding: 8px 16px;
}
</style>