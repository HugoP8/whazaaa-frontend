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
          >
            {{ getStatusLabel(campaign.campaign.status) }}
          </v-chip>
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
            <h3 class="text-h4">{{ campaign.campaign.totalRecipients || 0 }}</h3>
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
            <h3 class="text-h4">{{ campaign.campaign.sentCount || 0 }}</h3>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/utils/constants'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'

dayjs.extend(durationPlugin)

const route = useRoute()
const store = useStore()

const messageSearch = ref('')
const campaign = computed(() => store.getters['campaigns/currentCampaign'])

const messageHeaders = [
  { title: 'Destinatario', key: 'recipient' },
  { title: 'Estado', key: 'status' },
  { title: 'ID Mensaje', key: 'messageId' },
  { title: 'Error', key: 'error' },
  { title: 'Fecha', key: 'createdAt' }
]

const failedCount = computed(() => {
  if (!campaign.value) return 0
  return campaign.value.messages.filter(m => m.status === 'FAILED').length
})

const successRate = computed(() => {
  if (!campaign.value?.campaign.totalRecipients) return 0
  return Math.round((campaign.value.campaign.sentCount / campaign.value.campaign.totalRecipients) * 100)
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

onMounted(() => {
  store.dispatch('campaigns/fetchCampaignById', route.params.id)
})
</script>