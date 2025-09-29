<template>
  <div class="campaign-stats">
    <!-- Estadísticas principales -->
    <v-row class="mb-4">
      <v-col v-for="stat in mainStats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card class="text-center pa-4" elevation="2">
          <v-icon :color="stat.color" size="48" class="mb-2">{{ stat.icon }}</v-icon>
          <div class="text-h4 font-weight-bold" :class="`text-${stat.color}`">
            {{ stat.value }}
          </div>
          <div class="text-subtitle-2 text-grey">{{ stat.title }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row>
      <!-- Gráfico de campañas por estado -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Campañas por Estado
          </v-card-title>
          <v-card-text>
            <div v-if="statusChartData" class="chart-container">
              <!-- Aquí puedes integrar Chart.js o usar el componente que prefieras -->
              <div class="simple-chart">
                <div v-for="item in statusChartData" :key="item.label" class="chart-item mb-2">
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <div
                        class="chart-color-indicator me-2"
                        :style="{ backgroundColor: item.color }"
                      ></div>
                      <span>{{ item.label }}</span>
                    </div>
                    <span class="font-weight-bold">{{ item.value }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(item.value / totalCampaigns) * 100"
                    :color="item.color"
                    height="6"
                    class="mt-1"
                  />
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <v-progress-circular indeterminate />
              <div class="mt-2">Cargando datos...</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Estadísticas de mensajes -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            Estadísticas de Mensajes
          </v-card-title>
          <v-card-text>
            <div v-if="messageStats">
              <div class="message-stat mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span>Total Enviados</span>
                  <span class="font-weight-bold text-primary">{{ messageStats.totalSent || 0 }}</span>
                </div>
                <v-progress-linear
                  :model-value="100"
                  color="primary"
                  height="6"
                />
              </div>

              <div class="message-stat mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span>Exitosos</span>
                  <span class="font-weight-bold text-success">{{ messageStats.successful || 0 }}</span>
                </div>
                <v-progress-linear
                  :model-value="getPercentage(messageStats.successful, messageStats.totalSent)"
                  color="success"
                  height="6"
                />
              </div>

              <div class="message-stat mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span>Fallidos</span>
                  <span class="font-weight-bold text-error">{{ messageStats.failed || 0 }}</span>
                </div>
                <v-progress-linear
                  :model-value="getPercentage(messageStats.failed, messageStats.totalSent)"
                  color="error"
                  height="6"
                />
              </div>

              <div class="message-stat">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span>Tasa de Éxito</span>
                  <span class="font-weight-bold" :class="getSuccessRateColor()">
                    {{ getSuccessRate() }}%
                  </span>
                </div>
                <v-progress-linear
                  :model-value="getSuccessRate()"
                  :color="getSuccessRateColor().replace('text-', '')"
                  height="6"
                />
              </div>
            </div>
            <div v-else class="text-center py-4">
              <v-progress-circular indeterminate />
              <div class="mt-2">Cargando datos...</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Métricas adicionales -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
            Métricas Adicionales
          </v-card-title>
          <v-card-text>
            <v-row v-if="additionalMetrics">
              <v-col v-for="metric in additionalMetrics" :key="metric.key" cols="12" sm="6" md="3">
                <div class="metric-item text-center pa-3">
                  <v-icon :color="metric.color" size="32" class="mb-1">{{ metric.icon }}</v-icon>
                  <div class="text-h6 font-weight-bold">{{ metric.value }}</div>
                  <div class="text-caption text-grey">{{ metric.label }}</div>
                </div>
              </v-col>
            </v-row>
            <div v-else class="text-center py-4">
              <v-progress-circular indeterminate />
              <div class="mt-2">Cargando métricas...</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { whatsappService } from '@/services/whatsappService'

export default {
  name: 'CampaignStats',

  setup() {
    const store = useStore()
    const stats = ref(null)
    const loading = ref(false)

    const mainStats = computed(() => {
      if (!stats.value) return []

      return [
        {
          title: 'Total Campañas',
          value: stats.value.totalCampaigns || 0,
          icon: 'mdi-email-multiple',
          color: 'primary'
        },
        {
          title: 'Completadas',
          value: stats.value.completedCampaigns || 0,
          icon: 'mdi-check-circle',
          color: 'success'
        },
        {
          title: 'En Progreso',
          value: stats.value.activeCampaigns || 0,
          icon: 'mdi-clock',
          color: 'warning'
        },
        {
          title: 'Fallidas',
          value: stats.value.failedCampaigns || 0,
          icon: 'mdi-alert-circle',
          color: 'error'
        }
      ]
    })

    const statusChartData = computed(() => {
      if (!stats.value) return null

      return [
        {
          label: 'Completadas',
          value: stats.value.completedCampaigns || 0,
          color: '#4CAF50'
        },
        {
          label: 'En Progreso',
          value: stats.value.activeCampaigns || 0,
          color: '#FF9800'
        },
        {
          label: 'Pausadas',
          value: stats.value.pausedCampaigns || 0,
          color: '#2196F3'
        },
        {
          label: 'Fallidas',
          value: stats.value.failedCampaigns || 0,
          color: '#F44336'
        }
      ].filter(item => item.value > 0)
    })

    const totalCampaigns = computed(() => {
      return stats.value?.totalCampaigns || 1
    })

    const messageStats = computed(() => {
      return stats.value?.messageStats || null
    })

    const additionalMetrics = computed(() => {
      if (!stats.value) return null

      return [
        {
          key: 'avgMessagesPerCampaign',
          label: 'Promedio por Campaña',
          value: Math.round(stats.value.avgMessagesPerCampaign || 0),
          icon: 'mdi-calculator',
          color: 'blue'
        },
        {
          key: 'totalContacts',
          label: 'Total Contactos',
          value: stats.value.totalContacts || 0,
          icon: 'mdi-account-group',
          color: 'green'
        },
        {
          key: 'totalGroups',
          label: 'Total Grupos',
          value: stats.value.totalGroups || 0,
          icon: 'mdi-account-multiple',
          color: 'purple'
        },
        {
          key: 'lastCampaignDate',
          label: 'Última Campaña',
          value: formatDate(stats.value.lastCampaignDate),
          icon: 'mdi-calendar',
          color: 'orange'
        }
      ]
    })

    const loadStats = async () => {
      loading.value = true
      try {
        console.log('[CampaignStats] Cargando estadísticas...')
        const response = await whatsappService.getCampaignStats()
        stats.value = response.data || response
        console.log('[CampaignStats] Estadísticas cargadas:', stats.value)
      } catch (error) {
        console.error('[CampaignStats] Error cargando estadísticas:', error)
        // Usar datos de fallback
        stats.value = {
          totalCampaigns: 0,
          completedCampaigns: 0,
          activeCampaigns: 0,
          failedCampaigns: 0,
          messageStats: {
            totalSent: 0,
            successful: 0,
            failed: 0
          }
        }
      } finally {
        loading.value = false
      }
    }

    const getPercentage = (value, total) => {
      if (!total || total === 0) return 0
      return Math.round((value / total) * 100)
    }

    const getSuccessRate = () => {
      if (!messageStats.value || !messageStats.value.totalSent) return 0
      return getPercentage(messageStats.value.successful, messageStats.value.totalSent)
    }

    const getSuccessRateColor = () => {
      const rate = getSuccessRate()
      if (rate >= 90) return 'text-success'
      if (rate >= 70) return 'text-warning'
      return 'text-error'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch (error) {
        return 'N/A'
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      loading,
      mainStats,
      statusChartData,
      totalCampaigns,
      messageStats,
      additionalMetrics,
      loadStats,
      getPercentage,
      getSuccessRate,
      getSuccessRateColor,
      formatDate
    }
  }
}
</script>

<style scoped>
.campaign-stats {
  width: 100%;
}

.chart-container {
  min-height: 200px;
}

.simple-chart {
  padding: 16px 0;
}

.chart-item {
  margin-bottom: 12px;
}

.chart-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.message-stat {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 12px;
  border-radius: 8px;
}

.metric-item {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.metric-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  transform: translateY(-2px);
}
</style>