<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          Dashboard
        </h1>
      </v-col>
    </v-row>
    
    <!-- Estado de WhatsApp -->
    <v-row v-if="!isConnected">
      <v-col cols="12">
        <qr-code />
      </v-col>
    </v-row>
    
    <!-- Estadísticas -->
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
              <!-- Aquí iría un gráfico con Chart.js o similar -->
              <div class="d-flex align-center justify-center fill-height text-grey">
                Gráfico de mensajes
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
            <v-list>
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
          @click="$router.push(action.to)"
        >
          <v-card-text class="text-center pa-6">
            <v-icon
              :color="action.color"
              size="48"
              class="mb-3"
            >
              {{ action.icon }}
            </v-icon>
            <h3 class="text-h6">{{ action.title }}</h3>
            <p class="text-body-2 text-grey mt-2">
              {{ action.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import QRCode from '@/components/whatsapp/QRCode.vue'
import { CAMPAIGN_STATUS_COLORS } from '@/utils/constants'
import dayjs from 'dayjs'

const store = useStore()

const isConnected = computed(() => store.getters['whatsapp/isConnected'])
const campaignStats = computed(() => store.getters['campaigns/campaignStats'])
const recentCampaigns = computed(() => store.getters['campaigns/recentCampaigns'])

const stats = computed(() => [
  {
    title: 'Campañas Totales',
    value: campaignStats.value.total || 0,
    icon: 'mdi-email-multiple',
    color: 'primary'
  },
  {
    title: 'Completadas',
    value: campaignStats.value.completed || 0,
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    title: 'En Progreso',
    value: campaignStats.value.inProgress || 0,
    icon: 'mdi-progress-clock',
    color: 'info'
  },
  {
    title: 'Mensajes Hoy',
    value: 45, // TODO: Obtener del backend
    icon: 'mdi-message-text',
    color: 'warning'
  }
])

const quickActions = [
  {
    title: 'Nueva Campaña',
    description: 'Crear y enviar mensajes',
    icon: 'mdi-send',
    color: 'primary',
    to: '/campaigns/new'
  },
  {
    title: 'Ver Campañas',
    description: 'Gestionar campañas',
    icon: 'mdi-email-multiple',
    color: 'success',
    to: '/campaigns'
  },
  {
    title: 'Contactos',
    description: 'Administrar contactos',
    icon: 'mdi-contacts',
    color: 'info',
    to: '/contacts'
  },
  {
    title: 'Configuración',
    description: 'Ajustes del sistema',
    icon: 'mdi-cog',
    color: 'warning',
    to: '/settings'
  }
]

const getStatusColor = (status) => {
  return CAMPAIGN_STATUS_COLORS[status] || 'grey'
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

onMounted(() => {
  // Cargar datos iniciales
  if (isConnected.value) {
    store.dispatch('campaigns/fetchCampaigns')
  }
})
</script>