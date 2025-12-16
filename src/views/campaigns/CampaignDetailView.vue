<template>
  <div v-if="campaign">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn
            icon
            @click="$router.push('/campaigns')"
            class="mr-3"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold mr-4">
            {{ campaign.campaign.name }}
          </h1>
          <v-chip
            :color="getStatusColor(campaign.campaign.status)"
            size="large"
            class="mr-4"
          >
            {{ getStatusLabel(campaign.campaign.status) }}
          </v-chip>
          
          <!-- Botones de acción -->
          <div class="d-flex gap-2">
            <v-btn
              color="warning"
              variant="flat"
              @click="resendCampaign"
              :loading="isResending"
              :disabled="isResending"
            >
              <v-icon start>mdi-send</v-icon>
              {{ isResending ? 'Reenviando...' : 'Reenviar Campaña' }}
            </v-btn>
            
            <v-btn
              color="success"
              variant="outlined"
              @click="openReuseModal"
            >
              <v-icon start>mdi-recycle</v-icon>
              Reutilizar
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
    
    <!-- Resumen de estadísticas -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon size="48" color="primary" class="mb-2">
              mdi-account-multiple
            </v-icon>
            <h3 class="text-h4">{{ totalRecipients }}</h3>
            <p class="text-body-2 text-grey">Total Destinatarios</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon size="48" color="success" class="mb-2">
              mdi-check-circle
            </v-icon>
            <h3 class="text-h4">{{ sentCount }}</h3>
            <p class="text-body-2 text-grey">Enviados</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon size="48" color="error" class="mb-2">
              mdi-close-circle
            </v-icon>
            <h3 class="text-h4">{{ failedCount }}</h3>
            <p class="text-body-2 text-grey">Fallidos</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon size="48" color="info" class="mb-2">
              mdi-percent
            </v-icon>
            <h3 class="text-h4">{{ successRate }}%</h3>
            <p class="text-body-2 text-grey">Tasa de Éxito</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Información de la campaña -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Información General
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Creada</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(campaign.campaign.createdAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="campaign.campaign.completedAt">
                <v-list-item-title>Completada</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(campaign.campaign.completedAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-title>Duración</v-list-item-title>
                <v-list-item-subtitle>
                  {{ duration }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item v-if="campaign.campaign.mediaPath">
                <v-list-item-title>Archivo adjunto</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip size="small" prepend-icon="mdi-paperclip">
                    Archivo multimedia
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            <v-icon class="mr-2">mdi-message-text</v-icon>
            Mensaje
          </v-card-title>
          <v-card-text>
            <div class="chat-bubble sent">
              {{ campaign.campaign.message }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Detalles de mensajes -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="d-flex justify-space-between">
            <div>
              <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
              Detalles de Mensajes
            </div>
            <v-btn
              color="primary"
              variant="text"
              @click="exportResults"
            >
              <v-icon start>mdi-download</v-icon>
              Exportar
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="messageSearch"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="mb-4"
            ></v-text-field>

            <v-data-table
              :headers="messageHeaders"
              :items="campaign.messages"
              :search="messageSearch"
              :items-per-page="10"
            >
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="item.status === 'SENT' ? 'success' : 'error'"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de confirmación de reenvío -->
    <ResendConfirmModal
      v-model:show="showResendModal"
      :campaign-name="campaign?.campaign?.name || ''"
      :total-recipients="totalRecipients"
      :sent-count="sentCount"
      :loading="isResending"
      @confirm="handleResendConfirm"
      @cancel="showResendModal = false"
    />
  </div>
  
  <div v-else>
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
      class="d-block mx-auto mt-8"
    ></v-progress-circular>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/utils/constants'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import ResendConfirmModal from '@/components/campaigns/ResendConfirmModal.vue'

dayjs.extend(durationPlugin)

const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()

const messageSearch = ref('')
const isResending = ref(false)
const showResendModal = ref(false)
const campaign = computed(() => store.getters['campaigns/currentCampaign'])

// Computed para obtener el total de destinatarios de forma robusta
const totalRecipients = computed(() => {
  if (!campaign.value) return 0

  // Intentar diferentes fuentes de datos
  return campaign.value.campaign?.totalRecipients
    || campaign.value.campaign?.total_recipients
    || campaign.value.messages?.length
    || 0
})

// Computed para obtener el total de mensajes enviados de forma robusta
const sentCount = computed(() => {
  if (!campaign.value) return 0

  // Contar mensajes con estado SENT
  const sentFromMessages = campaign.value.messages?.filter(m => m.status === 'SENT').length || 0

  return campaign.value.campaign?.sentCount
    || campaign.value.campaign?.sent_count
    || sentFromMessages
    || 0
})

const messageHeaders = [
  { title: 'Destinatario', key: 'recipient' },
  { title: 'Estado', key: 'status' },
  { title: 'ID Mensaje', key: 'messageId' },
  { title: 'Error', key: 'error' },
  { title: 'Fecha', key: 'createdAt' }
]

const failedCount = computed(() => {
  if (!campaign.value) return 0
  return campaign.value.messages?.filter(m => m.status === 'FAILED').length || 0
})

const successRate = computed(() => {
  if (!totalRecipients.value || totalRecipients.value === 0) return 0
  return Math.round((sentCount.value / totalRecipients.value) * 100)
})

const duration = computed(() => {
  if (!campaign.value) return '-'
  
  const start = dayjs(campaign.value.campaign.createdAt)
  const end = campaign.value.campaign.completedAt 
    ? dayjs(campaign.value.campaign.completedAt)
    : dayjs()
  
  const diff = dayjs.duration(end.diff(start))
  
  if (diff.asMinutes() < 60) {
    return `${Math.floor(diff.asMinutes())} minutos`
  } else {
    return `${Math.floor(diff.asHours())} horas ${diff.minutes()} minutos`
  }
})

const getStatusColor = (status) => {
  return CAMPAIGN_STATUS_COLORS[status] || 'grey'
}

const getStatusLabel = (status) => {
  return CAMPAIGN_STATUS_LABELS[status] || status
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss')
}

const exportResults = () => {
  store.dispatch('campaigns/exportResults', route.params.id)
}

const resendCampaign = async () => {
  if (!campaign.value?.campaign?.id) {
    toast.error('No se puede reenviar: campaña no encontrada')
    return
  }

  try {
    // Verificar conexión de WhatsApp primero
    const whatsappStatus = await store.dispatch('whatsapp/checkStatus')
    if (!whatsappStatus.connected) {
      toast.error('Necesitas conectar WhatsApp antes de reenviar la campaña')
      return
    }

    // Mostrar modal de confirmación moderno
    showResendModal.value = true

  } catch (error) {
    console.error('[CampaignDetailView] Error al verificar estado:', error)
    toast.error('Error al verificar conexión de WhatsApp')
  }
}

const handleResendConfirm = async () => {
  try {
    // ⚡ VERIFICAR CRÉDITOS SUFICIENTES ANTES DE REENVIAR
    // 1 CAMPAÑA = 1 CRÉDITO (sin importar destinatarios)
    const totalCredits = store.getters['credits/totalCredits']
    const requiredCredits = 1

    if (totalCredits < requiredCredits) {
      toast.error(`Créditos insuficientes. Necesitas ${requiredCredits} crédito, tienes ${totalCredits}`)
      showResendModal.value = false
      return
    }

    // Mostrar loading
    isResending.value = true

    console.log('[CampaignDetailView] Reenviando campaña:', campaign.value.campaign.id)
    const result = await store.dispatch('campaigns/resendCampaign', campaign.value.campaign.id)

    // ⚡ ACTUALIZAR BALANCE DESPUÉS DE REENVIAR
    await store.dispatch('credits/fetchBalance')

    // Cerrar modal
    showResendModal.value = false

    // Manejar respuesta asíncrona
    if (result.data?.async) {
      //toast.success('Reenvío iniciado correctamente')
      //toast.info('Redirigiendo a campañas para ver el progreso en tiempo real...')

      // Redirigir a /campaigns para ver el progreso en tiempo real
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/campaigns')
    } else {
      toast.success('Campaña reenviada exitosamente')
      // Igual redirigir a campañas
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/campaigns')
    }

  } catch (error) {
    console.error('[CampaignDetailView] Error al reenviar campaña:', error)

    // El error ya fue manejado en el store, pero podemos mostrar información adicional
    if (error.code === 'ECONNABORTED') {
      toast.info('El reenvío puede estar procesándose en segundo plano', {
        timeout: 10000
      })
      // Redirigir igualmente
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/campaigns')
    }
  } finally {
    isResending.value = false
  }
}

const openReuseModal = async () => {
  if (!campaign.value?.campaign?.id) {
    toast.error('No se puede reutilizar: campaña no encontrada')
    return
  }

  try {
    console.log('[CampaignDetailView] Reutilizando campaña:', campaign.value.campaign.id)

    // Obtener datos de reutilización
    const response = await store.dispatch('campaigns/getCampaignReuseData', campaign.value.campaign.id)
    console.log('[CampaignDetailView] Datos de reutilización obtenidos:', response)

    // Guardar datos en el store para que NewCampaignView los use
    store.commit('campaigns/SET_REUSE_DATA', response)

    // Redirigir a nueva campaña con parámetro de reutilización
    router.push({
      path: '/campaigns/new',
      query: {
        reuse: campaign.value.campaign.id,
        from: 'detail'
      }
    })

  } catch (error) {
    console.error('[CampaignDetailView] Error al obtener datos de reutilización:', error)
    toast.error('Error al cargar datos para reutilizar la campaña')
  }
}

// Configurar eventos de WebSocket para reenvíos y progreso
const setupSocketEvents = () => {
  const socket = store.state.whatsapp.socket
  if (!socket) return

  // Escuchar eventos de finalización de campaña
  socket.on('campaign-completed', (data) => {
    console.log('[CampaignDetailView] Campaña completada:', data)

    if (data.resent) {
      // Es un reenvío completado
      toast.success(`Reenvío completado: ${data.successCount}/${data.totalCount} mensajes enviados`, {
        timeout: 10000
      })

      // Actualizar campañas
      store.dispatch('campaigns/fetchCampaigns')

      // Si estamos en la página de la campaña original, refrescar
      if (route.params.id == data.originalCampaignId) {
        store.dispatch('campaigns/fetchCampaign', data.originalCampaignId)
      }
    }
  })

  // Escuchar errores de campaña
  socket.on('campaign-error', (data) => {
    console.log('[CampaignDetailView] Error en campaña:', data)
    toast.error(`Error en reenvío de campaña: ${data.error}`)

    // Actualizar campañas para reflejar el estado de error
    store.dispatch('campaigns/fetchCampaigns')
  })

  // Escuchar progreso de campañas (incluso para reenvíos)
  socket.on('campaign-progress', (data) => {
    console.log('[CampaignDetailView] Progreso de campaña:', data)

    // Mostrar progreso solo para campañas relevantes
    if (data.campaignId == route.params.id || data.originalCampaignId == route.params.id) {
      // Actualizar progreso en el store de whatsapp
      store.commit('whatsapp/CAMPAIGN_PROGRESS', data)

      // Mostrar toast con progreso cada cierto número de mensajes
      if (data.sent % 10 === 0 || data.sent === data.total) {
        toast.info(`Progreso: ${data.sent}/${data.total} (${Math.round(data.percentage)}%)`, {
          timeout: 3000
        })
      }
    }
  })
}

const cleanupSocketEvents = () => {
  const socket = store.state.whatsapp.socket
  if (!socket) return

  socket.off('campaign-completed')
  socket.off('campaign-error')
  socket.off('campaign-progress')
}

onMounted(() => {
  store.dispatch('campaigns/fetchCampaignById', route.params.id)
  setupSocketEvents()
})

onUnmounted(() => {
  cleanupSocketEvents()
})
</script>