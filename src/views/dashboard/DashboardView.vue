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
    
    <!-- Estadísticas - Solo cuando está conectado -->
    <v-row v-else>
      <v-col
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card
          elevation="2"
          rounded="xl"
          class="hover-scale"
        >
          <v-card-text class="text-center pa-6">
            <v-icon
              :color="stat.color"
              size="48"
              class="mb-4"
            >
              {{ stat.icon }}
            </v-icon>
            <h3 class="text-h3 font-weight-bold">
              {{ stat.value }}
            </h3>
            <p class="text-body-2 text-grey mt-1">
              {{ stat.title }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Gráficos y actividad reciente -->
    <v-row v-if="isConnected" class="mt-4">
      <!-- Gráfico de mensajes -->
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            Mensajes enviados (últimos 7 días)
          </v-card-title>
          <v-card-text>
            <v-sheet height="300">
              <div class="d-flex align-center justify-center fill-height text-grey">
                <div class="text-center">
                  <v-icon size="48" color="grey-lighten-1">mdi-chart-line</v-icon>
                  <p class="mt-2">Gráfico de mensajes próximamente</p>
                </div>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Campañas recientes -->
      <v-col cols="12" md="4">
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
            <v-list v-if="recentCampaigns.length > 0">
              <v-list-item
                v-for="campaign in recentCampaigns"
                :key="campaign.id"
                @click="$router.push(`/campaigns/${campaign.id}`)"
                class="px-0"
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
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import QRCode from '@/components/whatsapp/QRCode.vue'
import { CAMPAIGN_STATUS_COLORS } from '@/utils/constants'
import dayjs from 'dayjs'

const store = useStore()
const router = useRouter()

// Estados reactivos
const loadingCampaigns = ref(false)
const campaignStats = ref({
  total: 0,
  completed: 0,
  inProgress: 0,
  failed: 0
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

const stats = computed(() => {
  const statData = campaignStats.value || {}
  return [
    {
      title: 'Campañas Totales',
      value: statData.total || 0,
      icon: 'mdi-email-multiple',
      color: 'primary'
    },
    {
      title: 'Completadas',
      value: statData.completed || 0,
      icon: 'mdi-check-circle',
      color: 'success'
    },
    {
      title: 'En Progreso',
      value: statData.inProgress || 0,
      icon: 'mdi-progress-clock',
      color: 'info'
    },
    {
      title: 'Fallidas',
      value: statData.failed || 0,
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

const loadCampaignStats = async () => {
  if (!isConnected.value) return
  
  try {
    loadingCampaigns.value = true
    console.log('[Dashboard] Cargando estadísticas de campañas...')
    
    const stats = await store.dispatch('campaigns/fetchCampaignStats')
    campaignStats.value = stats || {
      total: 0,
      completed: 0,
      inProgress: 0,
      failed: 0
    }
    
    console.log('[Dashboard] Estadísticas cargadas:', stats)
  } catch (error) {
    console.error('[Dashboard] Error cargando estadísticas:', error)
    // Establecer valores por defecto si hay error
    campaignStats.value = {
      total: 0,
      completed: 0,
      inProgress: 0,
      failed: 0
    }
  } finally {
    loadingCampaigns.value = false
  }
}

const loadRecentCampaigns = async () => {
  if (!isConnected.value) return
  
  try {
    console.log('[Dashboard] Cargando campañas recientes...')
    await store.dispatch('campaigns/fetchCampaigns', { 
      page: 1, 
      perPage: 5 
    })
    console.log('[Dashboard] Campañas recientes cargadas')
  } catch (error) {
    console.error('[Dashboard] Error cargando campañas recientes:', error)
    // No mostrar error al usuario para campañas recientes
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
      loadRecentCampaigns()
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
        loadRecentCampaigns()
      ])
    }
  } catch (error) {
    console.error('[Dashboard] Error en inicialización:', error)
    // No bloquear la carga del dashboard por errores de verificación
  }
})
</script>

<style scoped>
.hover-scale {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.hover-scale:hover {
  transform: scale(1.03);
}

.campaign-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.campaign-card:hover:not(.v-card--disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.campaign-card.v-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-green-darken-1 {
  color: #2e7d32 !important;
}

.text-green-darken-2 {
  color: #1b5e20 !important;
}
</style>