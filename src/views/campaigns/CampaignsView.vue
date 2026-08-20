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
    
    <!-- Error al cargar -->
    <v-row v-if="loadError" class="mt-4">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" closable @click:close="loadError = null">
          {{ loadError }} — la lista puede estar desactualizada.
          <template v-slot:append>
            <v-btn size="small" variant="text" @click="loadCampaignsWithFilters()">Reintentar</v-btn>
          </template>
        </v-alert>
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
            :items-per-page="pagination.perPage"
            hide-default-footer
            class="elevation-0"
          >
            <template v-slot:no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2">mdi-email-off-outline</v-icon>
                <p class="text-h6 mt-4 text-grey">
                  {{ search || statusFilter ? 'No se encontraron campañas con esos filtros' : 'Aún no tienes campañas' }}
                </p>
                <v-btn
                  v-if="!search && !statusFilter"
                  color="primary"
                  class="mt-2"
                  @click="$router.push('/campaigns/new')"
                >
                  Crear primera campaña
                </v-btn>
              </div>
            </template>
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

                <!-- Campaña programada, todavía no se envió -->
                <div v-else-if="item.status === 'SCHEDULED'">
                  <div class="text-caption mb-1">
                    <v-icon size="small" color="purple">mdi-calendar-clock</v-icon>
                    Se enviará: {{ formatDate(item.send_at) }}
                  </div>
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="outlined"
                    class="mr-1 mt-1"
                    @click="executeCampaignNow(item.id)"
                    :disabled="executingCampaigns.includes(item.id)"
                    :loading="executingCampaigns.includes(item.id)"
                  >
                    <v-icon start size="small">mdi-send</v-icon>
                    Enviar ahora
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="primary"
                    variant="outlined"
                    class="mr-1 mt-1"
                    @click="openRescheduleDialog(item)"
                  >
                    <v-icon start size="small">mdi-calendar-edit</v-icon>
                    Reprogramar
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="warning"
                    variant="outlined"
                    class="mt-1"
                    @click="cancelCampaign(item.id)"
                    :disabled="cancellingCampaigns.includes(item.id)"
                    :loading="cancellingCampaigns.includes(item.id)"
                  >
                    <v-icon start size="small">mdi-stop</v-icon>
                    Cancelar
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
          <v-card-actions v-if="pagination.totalPages > 1" class="justify-center pa-4">
            <v-pagination
              :model-value="pagination.page"
              @update:model-value="goToPage"
              :length="pagination.totalPages"
              :total-visible="7"
            ></v-pagination>
          </v-card-actions>
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
    
    <!-- Dialog de reprogramación -->
    <v-dialog
      v-model="rescheduleDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-2">mdi-calendar-edit</v-icon>
          Reprogramar campaña
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="rescheduleDate"
            type="datetime-local"
            label="Nueva fecha y hora"
            :min="minRescheduleDateTime"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="rescheduleDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="rescheduling"
            :disabled="!rescheduleDate"
            @click="submitReschedule"
          >
            Guardar
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
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue'
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
const executingCampaigns = ref([]) // Array de IDs de campañas siendo enviadas manualmente ("Enviar ahora")

const rescheduleDialog = ref(false)
const rescheduleCampaignId = ref(null)
const rescheduleDate = ref('')
const rescheduling = ref(false)

const loadError = ref(null)

watch([statusFilter, sortBy], () => {
  loadCampaignsWithFilters(1)
}, { deep: true })

let searchTimeout = null
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadCampaignsWithFilters(1), 500)
})

const loading = computed(() => store.getters['campaigns/loading'])
const campaigns = computed(() => store.getters['campaigns/campaigns'])
const pagination = computed(() => store.getters['campaigns/pagination'])

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

const loadCampaignsWithFilters = async (page) => {
  const params = { page: page || pagination.value.page || 1 }

  if (statusFilter.value) params.status = statusFilter.value

  if (sortBy.value) {
    const hasMinusPrefix = sortBy.value.startsWith('-')
    params.sortBy = sortBy.value.replace('-', '')
    params.sortOrder = hasMinusPrefix ? 'asc' : 'desc'
  }

  if (search.value?.trim()) params.search = search.value.trim()

  try {
    await store.dispatch('campaigns/fetchCampaigns', params)
    loadError.value = null
  } catch (error) {
    console.error('[CampaignsView] Error al cargar campañas:', error)
    loadError.value = error.response?.data?.message || error.message || 'Error al cargar campañas'
  }
}

const goToPage = (page) => {
  loadCampaignsWithFilters(page)
}

const filteredCampaigns = computed(() => {
  const list = campaigns.value
  return Array.isArray(list) ? list : []
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
  if (!dateString || dateString === 'null') return 'Sin fecha'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
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
  loadCampaignsWithFilters()
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

// ── Socket ───────────────────────────────────────────────────
let activeSocket = null

const attachSocketListeners = (socket) => {
  if (!socket || socket === activeSocket) return
  if (activeSocket) {
    activeSocket.off('campaign-started')
    activeSocket.off('campaign-progress')
    activeSocket.off('campaign-completed')
    activeSocket.off('campaign-cancelled')
  }
  activeSocket = socket
  setupSocketListeners(socket)
}

const setupSocketListeners = (socket) => {
  socket.on('campaign-started', () => {
    // Nueva campaña iniciada: recargar lista y arrancar polling
    store.dispatch('campaigns/fetchCampaigns').catch(() => {})
    startProgressPolling()
  })
  socket.on('campaign-progress', (data) => {
    store.commit('campaigns/UPDATE_CAMPAIGN_PROGRESS', {
      campaignId: data.campaignId,
      sentCount: data.sent || data.sentCount || 0,
      totalCount: data.total || data.totalCount
    })
  })
  socket.on('campaign-completed', (data) => {
    store.commit('campaigns/UPDATE_CAMPAIGN_COMPLETED', {
      campaignId: data.campaignId,
      status: data.status || 'COMPLETED',
      successCount: data.successCount
    })
    toast.success(`Campaña completada: ${data.successCount}/${data.totalCount} enviados`)
    setTimeout(() => store.dispatch('campaigns/fetchCampaigns').catch(() => {}), 2000)
  })
  socket.on('campaign-cancelled', (data) => {
    store.commit('campaigns/UPDATE_CAMPAIGN_STATUS', { campaignId: data.campaignId, status: 'CANCELLED' })
    toast.info('Campaña cancelada')
  })
}

// ── Polling (fuente primaria de progreso — BD se actualiza en tiempo real) ──
// El backend actualiza sent_count en la BD durante cada envío, así que un
// poll simple garantiza que la UI muestra el estado real.
let pollInterval = null

const startProgressPolling = () => {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    const hasActive = campaigns.value.some(c => c.status === 'IN_PROGRESS')
    if (!hasActive) {
      clearInterval(pollInterval)
      pollInterval = null
      return
    }
    store.dispatch('campaigns/fetchCampaigns').catch(() => {})
  }, 3000)
}

// Arrancar polling si hay campañas activas cuando cambia la lista
watch(campaigns, (list) => {
  if (list.some(c => c.status === 'IN_PROGRESS')) startProgressPolling()
}, { deep: false })

onMounted(async () => {
  await loadCampaignsWithFilters()
  if (campaigns.value.some(c => c.status === 'IN_PROGRESS')) startProgressPolling()
})

watchEffect(() => {
  const socket = store.getters['whatsapp/socket']
  if (socket) attachSocketListeners(socket)
})

onUnmounted(() => {
  if (activeSocket) {
    activeSocket.off('campaign-started')
    activeSocket.off('campaign-progress')
    activeSocket.off('campaign-completed')
    activeSocket.off('campaign-cancelled')
    activeSocket = null
  }
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
})

// Refrescar lista
const refreshCampaignsList = () => {
  store.dispatch('campaigns/fetchCampaigns').catch(() => {})
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

const executeCampaignNow = async (campaignId) => {
  executingCampaigns.value.push(campaignId)
  try {
    await store.dispatch('whatsapp/executeCampaign', campaignId)
    refreshCampaignsList()
  } catch (error) {
    console.error('Error enviando campaña programada:', error)
    toast.error(error.message || 'Error al enviar la campaña')
  } finally {
    executingCampaigns.value = executingCampaigns.value.filter(id => id !== campaignId)
  }
}

// datetime-local trabaja en hora LOCAL del navegador
const toLocalDateTimeInputValue = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const minRescheduleDateTime = computed(() => toLocalDateTimeInputValue(new Date(Date.now() + 60000)))

const openRescheduleDialog = (item) => {
  rescheduleCampaignId.value = item.id
  rescheduleDate.value = item.send_at ? toLocalDateTimeInputValue(new Date(item.send_at)) : ''
  rescheduleDialog.value = true
}

const submitReschedule = async () => {
  if (!rescheduleDate.value) return
  rescheduling.value = true
  try {
    // Convertir de hora local del navegador a ISO/UTC — el backend interpreta
    // la fecha en SU propio huso horario si no viene con offset.
    const sendAtISO = new Date(rescheduleDate.value).toISOString()
    await store.dispatch('whatsapp/rescheduleCampaign', { campaignId: rescheduleCampaignId.value, sendAt: sendAtISO })
    rescheduleDialog.value = false
    refreshCampaignsList()
  } catch (error) {
    console.error('Error reprogramando campaña:', error)
    toast.error(error.message || 'Error al reprogramar campaña')
  } finally {
    rescheduling.value = false
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