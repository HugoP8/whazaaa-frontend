<!-- src/views/dashboard/DashboardView.vue - VERSIÓN CORREGIDA -->
<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          Dashboard
        </h1>
      </v-col>
    </v-row>
    
    <!-- Estado de WhatsApp - Solo mostrar QRCode sin interferir -->
    <v-row v-if="!isConnected">
      <v-col cols="12">
        <QRCode />
      </v-col>
    </v-row>

    <!-- Sección de créditos - Solo cuando está conectado -->
    <v-row v-if="isConnected" class="mb-4">
      <v-col cols="12" md="4">
        <CreditsWidget
          @open-recharge-modal="showRechargeModal = true"
        />
      </v-col>

      <!-- Estadísticas de campañas -->
      <v-col cols="12" md="8">
        <v-row>
          <v-col
            v-for="stat in stats"
            :key="stat.title"
            cols="6"
            lg="3"
          >
            <v-card
              elevation="2"
              rounded="xl"
              class="hover-scale stats-card"
              :class="{ 'loading-card': statsLoading }"
            >
              <v-card-text class="text-center pa-4">
                <template v-if="statsLoading">
                  <v-skeleton-loader type="avatar" class="mb-2 mx-auto"></v-skeleton-loader>
                  <v-skeleton-loader type="heading" class="mb-1"></v-skeleton-loader>
                  <v-skeleton-loader type="text" width="60%"></v-skeleton-loader>
                </template>
                <template v-else>
                  <v-icon
                    :color="stat.color"
                    size="40"
                    class="mb-2"
                  >
                    {{ stat.icon }}
                  </v-icon>
                  <h3 class="text-h4 font-weight-bold">
                    {{ stat.value }}
                  </h3>
                  <p class="text-caption text-grey mt-1">
                    {{ stat.title }}
                  </p>
                </template>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    
    <!-- Gráficos y actividad reciente -->
    <v-row v-if="isConnected" class="mt-4">
      <!-- Usage Widget -->
      <v-col cols="12" md="4">
        <UsageWidget />
      </v-col>

      <!-- Gráfico de mensajes - ACTUALIZADO CON DATOS REALES -->
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Mensajes enviados (últimos 7 días)
            </div>
            <v-chip
              v-if="last7DaysStats"
              color="primary"
              variant="tonal"
              size="small"
            >
              Total: {{ last7DaysStats.totalSent || 0 }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-sheet height="300" class="position-relative">
              <template v-if="chartLoading">
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="48"
                  ></v-progress-circular>
                </div>
              </template>
              <template v-else-if="!last7DaysStats || !last7DaysStats.chartData">
                <div class="d-flex align-center justify-center fill-height text-grey">
                  <div class="text-center">
                    <v-icon size="48" color="grey-lighten-1">mdi-chart-line-variant</v-icon>
                    <p class="mt-2">No hay datos disponibles</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <canvas ref="messagesChart"></canvas>
              </template>
            </v-sheet>

            <!-- Estadísticas adicionales -->
            <v-row v-if="last7DaysStats && !chartLoading" class="mt-4">
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-caption text-grey">Promedio/día</div>
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ Math.round(last7DaysStats.avgPerDay || 0) }}
                  </div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-caption text-grey">Día pico</div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{ last7DaysStats.peakDay || '-' }}
                  </div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-caption text-grey">Total enviados</div>
                  <div class="text-h6 font-weight-bold text-info">
                    {{ last7DaysStats.totalSent || 0 }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Campañas recientes -->
      <v-col cols="12" md="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <span>Campañas Recientes</span>
            <v-btn
              text
              color="primary"
              size="small"
              @click="$router.push('/campaigns')"
            >
              Ver todas
            </v-btn>
          </v-card-title>
          <v-card-text>
            <template v-if="campaignsLoading">
              <v-skeleton-loader
                v-for="i in 3"
                :key="i"
                type="list-item-two-line"
                class="mb-2"
              ></v-skeleton-loader>
            </template>
            <template v-else>
              <v-list v-if="recentCampaigns.length > 0">
                <v-list-item
                  v-for="campaign in recentCampaigns"
                  :key="campaign.id"
                  @click="$router.push(`/campaigns/${campaign.id}`)"
                  class="px-0 hover-scale"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :color="getStatusColor(campaign.status)"
                      size="small"
                    >
                      mdi-circle
                    </v-icon>
                  </template>

                  <v-list-item-title>
                    {{ campaign.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(campaign.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <!-- Estado vacío -->
              <div v-else class="text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-email-outline</v-icon>
                <p class="text-grey mt-2">No hay campañas recientes</p>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="mt-2"
                  @click="$router.push('/campaigns/new')"
                >
                  Crear Primera Campaña
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Acciones rápidas -->
    <v-row v-if="isConnected" class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Acciones Rápidas</h2>
      </v-col>
      
      <v-col
        v-for="action in quickActions"
        :key="action.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          elevation="2"
          rounded="xl"
          class="campaign-card"
          @click="handleActionClick(action)"
          :disabled="action.disabled"
        >
          <v-card-text class="text-center pa-6">
            <v-icon
              :color="action.disabled ? 'grey' : action.color"
              size="48"
              class="mb-3"
            >
              {{ action.icon }}
            </v-icon>
            <h3 class="text-h6">{{ action.title }}</h3>
            <p class="text-body-2 text-grey mt-2">
              {{ action.description }}
            </p>
            <v-chip
              v-if="action.badge"
              size="small"
              :color="action.badgeColor"
              class="mt-2"
            >
              {{ action.badge }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Información adicional cuando está conectado -->
    <v-row v-if="isConnected" class="mt-4">
      <v-col cols="12">
        <v-card elevation="1" rounded="xl" color="green-lighten-5">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="green" size="24" class="mr-3">mdi-check-circle</v-icon>
              <div class="flex-grow-1">
                <p class="text-body-1 mb-1 text-green-darken-2">
                  <strong>WhatsApp Conectado</strong>
                </p>
                <p class="text-body-2 text-green-darken-1 mb-0">
                  Tu WhatsApp está listo para enviar mensajes masivos. 
                  {{ connectionInfo ? `Conectado como: ${connectionInfo.name || connectionInfo.id?.split(':')[0] || 'Usuario'}` : '' }}
                </p>
              </div>
              <v-btn
                color="green"
                variant="elevated"
                @click="$router.push('/campaigns/new')"
              >
                <v-icon left>mdi-send</v-icon>
                Crear Campaña
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de recarga de créditos -->
    <RechargeModal
      v-model="showRechargeModal"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import QRCode from '@/components/whatsapp/QRCode.vue'
import UsageWidget from '@/components/subscription/UsageWidget.vue'
import CreditsWidget from '@/components/subscription/CreditsWidget.vue'
import RechargeModal from '@/components/subscription/RechargeModal.vue'
import { CAMPAIGN_STATUS_COLORS } from '@/utils/constants'
import dayjs from 'dayjs'
import { Chart, registerables } from 'chart.js'
import api from '@/services/api'

// Registrar componentes de Chart.js
Chart.register(...registerables)

const store = useStore()
const router = useRouter()
const toast = useToast()

// Referencias
const messagesChart = ref(null)
let chartInstance = null

// Estados reactivos
const loadingCampaigns = ref(false)
const statsLoading = ref(false)
const campaignsLoading = ref(false)
const chartLoading = ref(false)
const last7DaysStats = ref(null)
const showRechargeModal = ref(false)
const rechargeLoading = ref(false)

// ✅ ACTUALIZADO: Usar nombres de campos del backend
const campaignStats = ref({
  totalCampaigns: 0,
  completedCampaigns: 0,
  activeCampaigns: 0,
  failedCampaigns: 0
})

// Estados computados
const isConnected = computed(() => {
  const connected = store.getters['whatsapp/isConnected']
  console.log('[Dashboard] isConnected:', connected)
  return connected
})

const connecting = computed(() => {
  const connecting = store.getters['whatsapp/isConnecting']
  console.log('[Dashboard] connecting:', connecting)
  return connecting
})

const connectionInfo = computed(() => {
  const info = store.getters['whatsapp/connectionInfo']
  console.log('[Dashboard] connectionInfo:', info)
  return info
})

const recentCampaigns = computed(() => {
  const campaigns = store.getters['campaigns/recentCampaigns'] || []
  console.log('[Dashboard] recentCampaigns:', campaigns.length)
  return campaigns
})

// Computed para balance de créditos
const creditBalance = computed(() => {
  const balance = store.getters['credits/balance']
  return balance || {
    total_credits: 0,
    plan_credits: 0,
    bonus_credits: 0,
    plan_name: 'free',
    plan_display_name: 'Gratuito'
  }
})

// ✅ ACTUALIZADO: Usar nombres de campos del backend
const stats = computed(() => {
  const statData = campaignStats.value || {}
  return [
    {
      title: 'Campañas Totales',
      value: statData.totalCampaigns || 0,  // ✅ Cambio: era total
      icon: 'mdi-email-multiple',
      color: 'primary'
    },
    {
      title: 'Completadas',
      value: statData.completedCampaigns || 0,  // ✅ Cambio: era completed
      icon: 'mdi-check-circle',
      color: 'success'
    },
    {
      title: 'En Progreso',
      value: statData.activeCampaigns || 0,  // ✅ Cambio: era inProgress
      icon: 'mdi-progress-clock',
      color: 'info'
    },
    {
      title: 'Fallidas',
      value: statData.failedCampaigns || 0,  // ✅ Cambio: era failed
      icon: 'mdi-alert-circle',
      color: 'error'
    }
  ]
})

const quickActions = computed(() => {
  const statData = campaignStats.value || {}
  return [
    {
      title: 'Nueva Campaña',
      description: 'Crear y enviar mensajes',
      icon: 'mdi-send',
      color: 'primary',
      to: '/campaigns/new',
      disabled: false,
      badge: 'Nuevo',
      badgeColor: 'primary'
    },
    {
      title: 'Ver Campañas',
      description: 'Gestionar campañas existentes',
      icon: 'mdi-email-multiple',
      color: 'success',
      to: '/campaigns',
      disabled: false,
      badge: statData.total > 0 ? `${statData.total}` : null,
      badgeColor: 'success'
    },
    {
      title: 'Contactos',
      description: 'Administrar contactos',
      icon: 'mdi-contacts',
      color: 'info',
      to: '/contacts',
      disabled: false
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: 'mdi-cog',
      color: 'warning',
      to: '/settings',
      disabled: false
    }
  ]
})

// Métodos
const getStatusColor = (status) => {
  return CAMPAIGN_STATUS_COLORS?.[status] || 'grey'
}

const formatDate = (date) => {
  if (!date) return 'Sin fecha'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const handleActionClick = (action) => {
  if (action.disabled) return

  if (action.to) {
    router.push(action.to)
  }
}

// Método para manejar éxito de recarga
const handleRechargeSuccess = async () => {
  console.log('[Dashboard] Recarga exitosa - Actualizando balance...')
  // Recargar balance después de solicitud exitosa
  await loadCreditBalance()
  toast.success('Solicitud de recarga registrada. Contacta a tu vendedor para completar el pago.')
}

// Cargar balance de créditos
const loadCreditBalance = async () => {
  try {
    console.log('[Dashboard] Cargando balance de créditos...')
    await store.dispatch('credits/fetchBalance')
    console.log('[Dashboard] Balance de créditos cargado')
  } catch (error) {
    console.error('[Dashboard] Error cargando balance de créditos:', error)
    // No mostrar error al usuario, el balance se muestra como 0 por defecto
  }
}

// ✅ ACTUALIZADO: Cargar estadísticas con nuevos campos
const loadCampaignStats = async () => {
  if (!isConnected.value) return

  try {
    statsLoading.value = true
    console.log('[Dashboard] Cargando estadísticas de campañas...')

    const stats = await store.dispatch('campaigns/fetchCampaignStats')
    campaignStats.value = stats || {
      totalCampaigns: 0,
      completedCampaigns: 0,
      activeCampaigns: 0,
      failedCampaigns: 0
    }

    console.log('[Dashboard] Estadísticas cargadas:', stats)
  } catch (error) {
    console.error('[Dashboard] Error cargando estadísticas:', error)
    campaignStats.value = {
      totalCampaigns: 0,
      completedCampaigns: 0,
      activeCampaigns: 0,
      failedCampaigns: 0
    }
  } finally {
    statsLoading.value = false
  }
}

// ✅ NUEVO: Cargar estadísticas de mensajes últimos 7 días
const loadLast7DaysStats = async () => {
  if (!isConnected.value) return

  try {
    chartLoading.value = true
    console.log('[Dashboard] Cargando estadísticas de últimos 7 días...')

    const response = await api.get('/whatsapp/stats/last-7-days')

    if (response.data.success) {
      last7DaysStats.value = response.data.data
      console.log('[Dashboard] Estadísticas de 7 días cargadas:', last7DaysStats.value)

      // Esperar a que el loading termine y el canvas sea visible
      chartLoading.value = false

      // Esperar dos ciclos de Vue para asegurar que el DOM esté completamente actualizado
      await nextTick()
      await nextTick()

      createChart()
    }
  } catch (error) {
    console.error('[Dashboard] Error cargando estadísticas de 7 días:', error)
    last7DaysStats.value = null
    chartLoading.value = false
  }
}

// ✅ NUEVO: Crear gráfico con Chart.js
const createChart = () => {
  console.log('[Dashboard] Intentando crear gráfico...')
  console.log('[Dashboard] messagesChart.value:', messagesChart.value)
  console.log('[Dashboard] last7DaysStats.value:', last7DaysStats.value)

  if (!messagesChart.value) {
    console.warn('[Dashboard] No se puede crear el gráfico - canvas ref no disponible')
    return
  }

  if (!last7DaysStats.value || !last7DaysStats.value.chartData) {
    console.warn('[Dashboard] No se puede crear el gráfico - datos faltantes', last7DaysStats.value)
    return
  }

  // Destruir gráfico anterior si existe
  if (chartInstance) {
    console.log('[Dashboard] Destruyendo gráfico anterior')
    chartInstance.destroy()
    chartInstance = null
  }

  try {
    const ctx = messagesChart.value.getContext('2d')
    const chartData = last7DaysStats.value.chartData

    console.log('[Dashboard] Creando gráfico con datos:', chartData)

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#64748B',
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              },
              padding: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(37, 211, 102, 0.9)',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            padding: 12,
            borderColor: '#25D366',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              title: (context) => {
                return context[0].label
              },
              label: (context) => {
                return `Mensajes: ${context.parsed.y}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#64748B',
              font: {
                size: 11
              },
              precision: 0
            }
          },
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#64748B',
              font: {
                size: 11
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    })

    console.log('[Dashboard] Gráfico creado exitosamente:', chartInstance)
  } catch (error) {
    console.error('[Dashboard] Error creando gráfico:', error)
  }
}

const loadRecentCampaigns = async () => {
  if (!isConnected.value) return

  try {
    campaignsLoading.value = true
    console.log('[Dashboard] Cargando campañas recientes...')
    await store.dispatch('campaigns/fetchCampaigns', {
      page: 1,
      perPage: 5
    })
    console.log('[Dashboard] Campañas recientes cargadas')
  } catch (error) {
    console.error('[Dashboard] Error cargando campañas recientes:', error)
    // No mostrar error al usuario para campañas recientes
  } finally {
    campaignsLoading.value = false
  }
}

// Watch para cargar datos cuando se conecte WhatsApp
watch(isConnected, async (newValue, oldValue) => {
  console.log('[Dashboard] WhatsApp connection changed:', { old: oldValue, new: newValue })

  if (newValue && !oldValue) {
    console.log('[Dashboard] WhatsApp conectado - Cargando datos...')

    // Cargar datos en paralelo
    await Promise.allSettled([
      loadCampaignStats(),
      loadRecentCampaigns(),
      loadLast7DaysStats(),
      loadCreditBalance()  // ✅ NUEVO: Cargar balance de créditos
    ])

    console.log('[Dashboard] Datos cargados exitosamente')
  }
}, { immediate: false })

// Lifecycle
onMounted(async () => {
  console.log('[Dashboard] Componente montado')

  try {
    // Verificar estado de WhatsApp sin intentar conectar
    await store.dispatch('whatsapp/checkStatus')
    console.log('[Dashboard] Estado de WhatsApp verificado')

    // Si ya está conectado, cargar datos inmediatamente
    if (isConnected.value) {
      console.log('[Dashboard] Ya conectado - Cargando datos iniciales...')
      await Promise.allSettled([
        loadCampaignStats(),
        loadRecentCampaigns(),
        loadLast7DaysStats(),
        loadCreditBalance()  // ✅ NUEVO: Cargar balance de créditos
      ])
    } else {
      // Aunque no esté conectado, intentar cargar el balance de créditos
      await loadCreditBalance()
    }
  } catch (error) {
    console.error('[Dashboard] Error en inicialización:', error)
    // No bloquear la carga del dashboard por errores de verificación
  }
})

// ✅ NUEVO: Limpiar gráfico al desmontar
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.15) !important;
  border-color: rgba(37, 211, 102, 0.1);
}

.loading-card {
  opacity: 0.8;
}

.campaign-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.campaign-card:hover:not(.v-card--disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.12) !important;
  border-color: rgba(37, 211, 102, 0.1);
}

.campaign-card.v-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-list-item.hover-scale {
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 2px 0;
}

.v-list-item.hover-scale:hover {
  background-color: rgba(37, 211, 102, 0.05);
  transform: translateX(4px);
}

/* Skeleton loader animations */
.v-skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive improvements */
@media (max-width: 768px) {
  .stats-card:hover {
    transform: none;
  }

  .campaign-card:hover:not(.v-card--disabled) {
    transform: none;
  }
}

.text-green-darken-1 {
  color: #2e7d32 !important;
}

.text-green-darken-2 {
  color: #1b5e20 !important;
}
</style>