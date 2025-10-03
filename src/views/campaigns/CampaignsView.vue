<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">
            Campañas
          </h1>
          <v-btn
            color="primary"
            size="large"
            @click="$router.push('/campaigns/new')"
          >
            <v-icon start>mdi-plus</v-icon>
            Nueva Campaña
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Filtros -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="search"
                  label="Buscar campañas"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  label="Estado"
                  :items="statusOptions"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="sortBy"
                  label="Ordenar por"
                  :items="sortOptions"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Lista de campañas -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-data-table
            :headers="headers"
            :items="filteredCampaigns"
            :loading="loading"
            :items-per-page="1000"
            class="elevation-0"
          >
            <!-- Estado -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusBadgeConfig(item).vuetifyColor"
                size="small"
                variant="tonal"
              >
                <v-icon start size="small">{{ getStatusBadgeConfig(item).icon }}</v-icon>
                {{ getStatusBadgeConfig(item).display }}
              </v-chip>
            </template>
            
            <!-- Progreso -->
            <template v-slot:item.progress="{ item }">
              <div style="min-width: 200px;">
                <!-- Campaña en progreso -->
                <div v-if="item.status === 'IN_PROGRESS' && item.total_recipients" class="progress-container">
                  <v-progress-linear
                    :model-value="getProgressPercentage(item)"
                    :color="getProgressColor(getProgressPercentage(item))"
                    height="24"
                    rounded
                    striped
                    class="mb-2"
                    :class="{ 'progress-animated': item.status === 'IN_PROGRESS' }"
                  >
                    <template v-slot:default>
                      <strong>
                        {{ item.sent_count || 0 }}/{{ item.total_recipients }}
                        ({{ getProgressPercentage(item) }}%)
                      </strong>
                    </template>
                  </v-progress-linear>

                  <!-- Botón cancelar para campañas en progreso -->
                  <v-btn
                    size="x-small"
                    color="warning"
                    variant="outlined"
                    @click="cancelCampaign(item.id)"
                    :disabled="cancellingCampaigns.includes(item.id)"
                    :loading="cancellingCampaigns.includes(item.id)"
                    class="mt-1"
                  >
                    <v-icon start size="small">mdi-stop</v-icon>
                    {{ cancellingCampaigns.includes(item.id) ? 'Cancelando...' : 'Cancelar' }}
                  </v-btn>
                </div>

                <!-- Estados finales -->
                <div v-else-if="item.total_recipients">
                  <v-chip
                    :color="getStatusColor(item.status)"
                    size="small"
                    class="mb-1"
                  >
                    {{ getStatusLabel(item.status) }}
                  </v-chip>

                  <!-- Estadísticas finales mejoradas -->
                  <div class="text-caption text-grey">
                    📊 {{ item.sent_count || 0 }}/{{ item.total_recipients }} enviados
                    <span v-if="item.success_percentage !== undefined && item.success_percentage !== null">
                      ({{ item.success_percentage }}% éxito)
                    </span>
                    <span v-else-if="item.sent_count && item.total_recipients">
                      ({{ Math.round((item.sent_count / item.total_recipients) * 100) }}% éxito)
                    </span>
                  </div>
                </div>

                <span v-else class="text-grey">-</span>
              </div>
            </template>
            
            <!-- Fecha -->
            <template v-slot:item.createdAt="{ item }">
              <div class="campaign-date">
                <!-- Fecha principal usando display_date -->
                <strong>{{ formatDate(item.display_date) }}</strong>

                <!-- Mostrar tipo de fecha -->
                <small class="text-grey d-block">
                  <span v-if="item.completed_at">
                    Completada: {{ formatDate(item.completed_at) }}
                  </span>
                  <span v-else-if="item.scheduled_at">
                    Programada: {{ formatDate(item.scheduled_at) }}
                  </span>
                  <span v-else>
                    Creada: {{ formatDate(item.created_at) }}
                  </span>
                </small>

                <!-- Duración si existe -->
                <small v-if="item.duration_seconds" class="text-info d-block">
                  ⏱️ {{ formatDuration(item.duration_seconds) }}
                </small>
              </div>
            </template>
            
            <!-- Acciones -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                @click="viewDetails(item)"
                title="Ver detalles"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              

              <v-btn
                icon
                size="small"
                color="success"
                @click="openReuseModal(item)"
                title="Reutilizar campaña"
              >
                <v-icon>mdi-recycle</v-icon>
              </v-btn>

              <v-btn
                icon
                size="small"
                color="error"
                @click="confirmDelete(item)"
                :disabled="item.status === 'IN_PROGRESS'"
                title="Eliminar campaña"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Dialog de confirmación -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar la campaña "{{ selectedCampaign?.name }}"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteCampaign"
            :loading="deleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Modal de reutilización -->
    <ReuseCampaignModal 
      :is-open="showReuseModal"
      :campaign-id="selectedCampaignId"
      @close="closeReuseModal"
      @success="onReuseSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { 
  CAMPAIGN_STATUS, 
  CAMPAIGN_STATUS_LABELS, 
  CAMPAIGN_STATUS_COLORS 
} from '@/utils/constants'
import { 
  getStatusBadgeConfig, 
  formatSuccessPercentage, 
  getProgressColor,
  formatCampaignDate,
  getCampaignTypeIcon
} from '@/utils/campaignUtils'
import ReuseCampaignModal from '@/components/campaigns/ReuseCampaignModal.vue'
import dayjs from 'dayjs'

const store = useStore()
const router = useRouter()
const toast = useToast()

const search = ref('')
const statusFilter = ref(null)
const sortBy = ref('createdAt') // Por defecto más reciente
const deleteDialog = ref(false)
const selectedCampaign = ref(null)
const deleting = ref(false)
const showReuseModal = ref(false)
const selectedCampaignId = ref(null)
const cancellingCampaigns = ref([]) // Array de IDs de campañas siendo canceladas

// Watch para recargar campañas cuando cambien los filtros
watch([statusFilter, sortBy], () => {
  console.log('[CampaignsView] 🔄 Filtros cambiados, recargando campañas...')
  loadCampaignsWithFilters()
}, { deep: true })

// Watch para búsqueda con debounce
let searchTimeout = null
watch(search, (newValue) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    console.log('[CampaignsView] 🔍 Búsqueda cambiada:', newValue)
    loadCampaignsWithFilters()
  }, 500) // Esperar 500ms después de que el usuario deje de escribir
})

const loading = computed(() => store.getters['campaigns/loading'])
const campaigns = computed(() => store.getters['campaigns/campaigns'])

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Progreso', key: 'progress', sortable: false },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

const statusOptions = Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, text]) => ({
  value,
  title: text
}))

const sortOptions = [
  { value: 'createdAt', title: 'Fecha (más reciente)' },
  { value: '-createdAt', title: 'Fecha (más antigua)' },
  { value: 'name', title: 'Nombre (A-Z)' },
  { value: '-name', title: 'Nombre (Z-A)' }
]

// Función para cargar campañas con filtros
const loadCampaignsWithFilters = async () => {
  const params = {}

  // Agregar filtro de estado si está seleccionado
  if (statusFilter.value) {
    params.status = statusFilter.value
  }

  // Agregar ordenamiento
  if (sortBy.value) {
    const hasMinusPrefix = sortBy.value.startsWith('-')
    const sortField = sortBy.value.replace('-', '')
    params.sortBy = sortField
    // Si tiene '-' → asc (más antigua), si NO tiene '-' → desc (más reciente)
    params.sortOrder = hasMinusPrefix ? 'asc' : 'desc'
  }

  // Agregar búsqueda si existe
  if (search.value && search.value.trim() !== '') {
    params.search = search.value.trim()
  }

  console.log('[CampaignsView] 📤 Enviando parámetros al backend:', params)
  console.log('[CampaignsView] 🔍 Desglose de parámetros:')
  console.log('  - status:', params.status || 'TODOS')
  console.log('  - sortBy:', params.sortBy || 'createdAt')
  console.log('  - sortOrder:', params.sortOrder || 'desc')
  console.log('  - search:', params.search || 'N/A')

  try {
    await store.dispatch('campaigns/fetchCampaigns', params)
    console.log('[CampaignsView] ✅ Campañas cargadas correctamente')
  } catch (error) {
    console.error('[CampaignsView] ❌ Error al cargar campañas:', error)
  }
}

// Computed simplificado - ya no filtra localmente, confía en el backend
const filteredCampaigns = computed(() => {
  const filtered = campaigns.value || []

  // Verificar que filtered sea un array
  if (!Array.isArray(filtered)) {
    console.warn('[CampaignsView] campaigns.value no es un array:', filtered)
    return []
  }

  return filtered
})

const getStatusColor = (status) => {
  return CAMPAIGN_STATUS_COLORS[status] || 'grey'
}

const getStatusLabel = (status) => {
  return CAMPAIGN_STATUS_LABELS[status] || status
}

const getProgress = (campaign) => {
  if (!campaign.total_recipients) return 0
  // Use backend success_percentage if available
  if (campaign.success_percentage !== undefined) {
    return parseFloat(campaign.success_percentage)
  }
  return (campaign.sent_count / campaign.total_recipients) * 100
}

const getProgressPercentage = (campaign) => {
  if (!campaign.total_recipients || campaign.total_recipients === 0) {
    return 0
  }
  return Math.round((campaign.sent_count / campaign.total_recipients) * 100)
}

const formatDate = (dateString) => {
  console.log('🔍 [DEBUG] Fecha recibida:', dateString)

  if (!dateString || dateString === null || dateString === 'null') {
    console.warn('❌ Fecha inválida:', dateString)
    return 'Sin fecha'
  }

  try {
    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('❌ Fecha no válida:', dateString)
      return 'Fecha inválida'
    }

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('❌ Error formateando fecha:', error)
    return 'Error fecha'
  }
}

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const viewDetails = (campaign) => {
  router.push(`/campaigns/${campaign.id}`)
}

const openReuseModal = (campaign) => {
  selectedCampaignId.value = campaign.id
  showReuseModal.value = true
}

const closeReuseModal = () => {
  showReuseModal.value = false
  selectedCampaignId.value = null
}

const onReuseSuccess = () => {
  console.log('[CampaignsView] Campaña reutilizada con éxito')
  // La lista se actualizará automáticamente gracias al store
}

const confirmDelete = (campaign) => {
  selectedCampaign.value = campaign
  deleteDialog.value = true
}

const deleteCampaign = async () => {
  deleting.value = true
  try {
    await store.dispatch('campaigns/deleteCampaign', selectedCampaign.value.id)
    deleteDialog.value = false
  } catch (error) {
    console.error('Error eliminando campaña:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  // Cargar campañas con filtros iniciales
  await loadCampaignsWithFilters()

  // DEBUG: Ver qué datos llegan
  console.log('🔍 [DEBUG] Campañas cargadas:', campaigns.value)
  if (campaigns.value?.length > 0) {
    console.log('🔍 [DEBUG] Primera campaña:', campaigns.value[0])
    console.log('🔍 [DEBUG] Campos de fecha disponibles:', {
      display_date: campaigns.value[0].display_date,
      created_at: campaigns.value[0].created_at,
      scheduled_at: campaigns.value[0].scheduled_at,
      completed_at: campaigns.value[0].completed_at,
      duration_seconds: campaigns.value[0].duration_seconds
    })
  }

  // Setup socket listeners for campaign updates
  const whatsappSocket = store.getters['whatsapp/socket']
  console.log('[CampaignsView] 🔌 Socket disponible:', !!whatsappSocket)
  console.log('[CampaignsView] 🔌 Socket conectado:', whatsappSocket?.connected)

  if (whatsappSocket) {
    setupSocketListeners(whatsappSocket)
  } else {
    console.warn('[CampaignsView] ⚠️ Socket no disponible. Esperando conexión...')
    // Intentar configurar listeners después de 2 segundos
    setTimeout(() => {
      const socket = store.getters['whatsapp/socket']
      if (socket) {
        console.log('[CampaignsView] ✅ Socket disponible después de espera')
        setupSocketListeners(socket)
      }
    }, 2000)
  }
})

onUnmounted(() => {
  // Clean up socket listeners
  const whatsappSocket = store.getters['whatsapp/socket']
  if (whatsappSocket) {
    whatsappSocket.off('campaign-started')
    whatsappSocket.off('campaign-completed')
    whatsappSocket.off('campaign-progress')
    whatsappSocket.off('campaign-cancelled')
  }
})

const setupSocketListeners = (socket) => {
  console.log('[CampaignsView] 🔌 Configurando listeners de Socket.IO')

  // Handle campaign started (nueva campaña o reenvío)
  socket.on('campaign-started', (data) => {
    console.log('[CampaignsView] 🚀 Nueva campaña iniciada:', data)
    // Refrescar lista para incluir la nueva campaña
    refreshCampaignsList()
  })

  // Handle campaign progress updates
  socket.on('campaign-progress', handleCampaignProgress)

  // Handle campaign completion
  socket.on('campaign-completed', handleCampaignCompleted)

  // Handle campaign cancellation
  socket.on('campaign-cancelled', handleCampaignCancelled)
}

const handleCampaignProgress = (data) => {
  console.log(`[CampaignsView] 📊 Progreso recibido:`, data)
  console.log(`[CampaignsView] 🔍 Buscando campaña ID: ${data.campaignId}`)

  // Actualizar campaña en la lista
  const campaign = campaigns.value.find(c => c.id == data.campaignId)

  if (campaign) {
    console.log(`[CampaignsView] ✅ Campaña encontrada, actualizando...`)

    // Actualizar campos con datos del socket
    campaign.sent_count = data.sent || data.sentCount || 0
    campaign.total_recipients = data.total || data.totalCount || campaign.total_recipients
    campaign.progress = data.percentage
    campaign.status = 'IN_PROGRESS'

    console.log(`[CampaignsView] 📈 Progreso actualizado: ${campaign.sent_count}/${campaign.total_recipients} (${data.percentage}%)`)

    // Force reactivity update
    store.commit('campaigns/UPDATE_CAMPAIGN', campaign)
  } else {
    console.warn(`[CampaignsView] ⚠️ Campaña ${data.campaignId} no encontrada en la lista. Refrescando...`)
    // Si la campaña no está en la lista, refrescar
    refreshCampaignsList()
  }
}

const handleCampaignCompleted = (data) => {
  console.log(`[CampaignsView] Completada: ${data.campaignId}`)

  // Actualizar campaña como completada
  const campaign = campaigns.value.find(c => c.id == data.campaignId)
  if (campaign) {
    campaign.status = 'COMPLETED'
    campaign.sent_count = data.successCount
    campaign.completed_at = new Date().toISOString()

    // Force reactivity update
    store.commit('campaigns/UPDATE_CAMPAIGN', campaign)
  }

  // Show success toast
  toast.success(`Campaña completada: ${data.successCount}/${data.totalCount} enviados`)

  // Refrescar después de 2 segundos para ver datos finales
  setTimeout(() => {
    refreshCampaignsList()
  }, 2000)
}

const handleCampaignCancelled = (data) => {
  console.log(`[CampaignsView] Cancelada: ${data.campaignId}`)

  const campaign = campaigns.value.find(c => c.id == data.campaignId)
  if (campaign) {
    campaign.status = 'CANCELLED'

    // Force reactivity update
    store.commit('campaigns/UPDATE_CAMPAIGN', campaign)
  }

  toast.info('Campaña cancelada')
}

// Refrescar lista automáticamente
const refreshCampaignsList = async () => {
  try {
    await store.dispatch('campaigns/fetchCampaigns')
  } catch (error) {
    console.error('Error refreshing campaigns:', error)
  }
}

// Función para cancelar campaña
const cancelCampaign = async (campaignId) => {
  cancellingCampaigns.value.push(campaignId)

  try {
    // Usar la acción de WhatsApp que sí tiene el endpoint implementado
    const response = await store.dispatch('whatsapp/cancelCampaign', campaignId)

    if (response && response.success !== false) {
      toast.success('Campaña cancelada exitosamente')

      // Refrescar lista de campañas
      refreshCampaignsList()
    }
  } catch (error) {
    console.error('Error cancelando campaña:', error)
    toast.error(error.message || 'Error cancelando campaña')
  } finally {
    cancellingCampaigns.value = cancellingCampaigns.value.filter(id => id !== campaignId)
  }
}
</script>

<style scoped>
/* Estados de campaña con bordes de color */
.campaign-in-progress {
  border-left: 4px solid #ffc107;
  background-color: #fff9e7;
}

.campaign-completed {
  border-left: 4px solid #28a745;
}

.campaign-cancelled {
  border-left: 4px solid #6c757d;
  opacity: 0.7;
}

/* Animaciones para progreso */
.progress-animated {
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* Efectos para barra de progreso */
.v-progress-linear.progress-animated .v-progress-linear__buffer {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
}

/* Mejoras visuales para progreso */
.progress-container {
  position: relative;
}

.progress-container .v-progress-linear {
  background: rgba(0, 0, 0, 0.1) !important;
}

/* Estados de badge mejorados */
.v-chip.badge-secondary {
  background-color: #6c757d !important;
  color: white !important;
}

/* Hover effects para botones de acción */
.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Estilos para texto de duración */
.text-grey {
  color: #6c757d !important;
  font-size: 0.75rem;
}

.text-info {
  color: #17a2b8 !important;
  font-size: 0.75rem;
}

/* Mejoras para la fecha de campaña */
.campaign-date {
  min-width: 140px;
}

/* Loading spinner personalizado */
.mdi-loading {
  animation: mdi-spin 1s linear infinite;
}

@keyframes mdi-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>