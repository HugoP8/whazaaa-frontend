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
            :search="search"
            :loading="loading"
            :items-per-page="10"
            class="elevation-0"
          >
            <!-- Estado -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ getStatusLabel(item.status) }}
              </v-chip>
            </template>
            
            <!-- Progreso -->
            <template v-slot:item.progress="{ item }">
              <div v-if="item.totalRecipients" style="min-width: 150px;">
                <v-progress-linear
                  :model-value="getProgress(item)"
                  :color="getStatusColor(item.status)"
                  height="20"
                  rounded
                >
                  <template v-slot:default>
                    {{ item.sentCount || 0 }}/{{ item.totalRecipients }}
                  </template>
                </v-progress-linear>
              </div>
              <span v-else>-</span>
            </template>
            
            <!-- Fecha -->
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            
            <!-- Acciones -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                @click="viewDetails(item)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              
              <v-btn
                icon
                size="small"
                color="error"
                @click="confirmDelete(item)"
                :disabled="item.status === 'IN_PROGRESS'"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { 
  CAMPAIGN_STATUS, 
  CAMPAIGN_STATUS_LABELS, 
  CAMPAIGN_STATUS_COLORS 
} from '@/utils/constants'
import dayjs from 'dayjs'

const store = useStore()
const router = useRouter()

const search = ref('')
const statusFilter = ref(null)
const sortBy = ref('createdAt')
const deleteDialog = ref(false)
const selectedCampaign = ref(null)
const deleting = ref(false)

const loading = computed(() => store.getters['campaigns/campaignsLoading'])
const campaigns = computed(() => store.getters['campaigns/allCampaigns'])

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

const filteredCampaigns = computed(() => {
  let filtered = campaigns.value
  
  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(c => c.status === statusFilter.value)
  }
  
  // Ordenamiento
  const sortKey = sortBy.value.replace('-', '')
  const sortDesc = sortBy.value.startsWith('-')
  
  filtered = [...filtered].sort((a, b) => {
    if (sortDesc) {
      return b[sortKey] > a[sortKey] ? 1 : -1
    }
    return a[sortKey] > b[sortKey] ? 1 : -1
  })
  
  return filtered
})

const getStatusColor = (status) => {
  return CAMPAIGN_STATUS_COLORS[status] || 'grey'
}

const getStatusLabel = (status) => {
  return CAMPAIGN_STATUS_LABELS[status] || status
}

const getProgress = (campaign) => {
  if (!campaign.totalRecipients) return 0
  return (campaign.sentCount / campaign.totalRecipients) * 100
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const viewDetails = (campaign) => {
  router.push(`/campaigns/${campaign.id}`)
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

onMounted(() => {
  store.dispatch('campaigns/fetchCampaigns')
})
</script>