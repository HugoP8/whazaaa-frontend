<template>
  <v-card elevation="2" rounded="xl">
    <v-card-title class="pa-6 bg-gradient-primary d-flex justify-space-between align-center">
      <div>
        <v-icon class="mr-2">mdi-history</v-icon>
        Historial de Créditos
      </div>
      <v-btn
        size="small"
        color="white"
        variant="text"
        prepend-icon="mdi-refresh"
        @click="loadHistory"
        :loading="loading"
      >
        Actualizar
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Filtros -->
      <div class="pa-4 border-b">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-select
              v-model="filters.type"
              label="Tipo de Transacción"
              :items="transactionTypes"
              clearable
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="filters.creditType"
              label="Tipo de Crédito"
              :items="creditTypes"
              clearable
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
        </v-row>
      </div>

      <!-- Lista de transacciones -->
      <div v-if="loading && !history.length" class="pa-6">
        <v-skeleton-loader
          v-for="i in 5"
          :key="i"
          type="list-item-two-line"
          class="mb-2"
        ></v-skeleton-loader>
      </div>

      <div v-else-if="!history.length" class="pa-8 text-center">
        <v-icon size="64" color="grey-lighten-1">mdi-history</v-icon>
        <p class="text-h6 text-grey mt-4">No hay transacciones</p>
        <p class="text-body-2 text-grey">Las transacciones aparecerán aquí cuando uses o recargues créditos</p>
      </div>

      <v-list v-else class="pa-0">
        <template v-for="(item, index) in history" :key="item.id">
          <v-list-item class="px-6 py-4">
            <template v-slot:prepend>
              <v-avatar :color="getTypeColor(item.transaction_type)" size="40">
                <v-icon color="white">{{ getTypeIcon(item.transaction_type) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ item.description }}
            </v-list-item-title>

            <v-list-item-subtitle class="d-flex align-center gap-2">
              <v-chip
                :color="getCreditTypeColor(item.credit_type)"
                size="x-small"
                variant="tonal"
              >
                {{ getCreditTypeLabel(item.credit_type) }}
              </v-chip>
              <span class="text-caption">{{ formatDate(item.created_at) }}</span>
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="text-right">
                <div
                  class="text-h6 font-weight-bold"
                  :class="item.amount > 0 ? 'text-success' : 'text-error'"
                >
                  {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
                </div>
                <div class="text-caption text-grey">
                  Balance: {{ item.balance_after }}
                </div>
              </div>
            </template>
          </v-list-item>

          <v-divider v-if="index < history.length - 1"></v-divider>
        </template>
      </v-list>

      <!-- Paginación -->
      <div v-if="pagination.total_pages > 1" class="pa-4 border-t">
        <v-pagination
          v-model="pagination.page"
          :length="pagination.total_pages"
          :total-visible="5"
          @update:model-value="changePage"
        ></v-pagination>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

const store = useStore()

// Estado
const loading = ref(false)
const filters = ref({
  type: null,
  creditType: null
})

// Computed
const history = computed(() => store.getters['credits/history'] || [])
const pagination = computed(() => store.getters['credits/historyPagination'] || {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0
})

// Tipos de transacción
const transactionTypes = [
  { title: 'Todas', value: null },
  { title: 'Agregado', value: 'add' },
  { title: 'Deducido', value: 'deduct' },
  { title: 'Renovación', value: 'renewal' },
  { title: 'Bonus', value: 'bonus' }
]

const creditTypes = [
  { title: 'Todos', value: null },
  { title: 'Plan', value: 'plan' },
  { title: 'Bonus', value: 'bonus' }
]

// Methods
const loadHistory = async () => {
  try {
    loading.value = true
    await store.dispatch('credits/fetchHistory', {
      page: pagination.value.page,
      limit: 20,
      type: filters.value.type,
      credit_type: filters.value.creditType
    })
  } catch (error) {
    console.error('Error loading history:', error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadHistory()
}

const changePage = (page) => {
  store.dispatch('credits/fetchHistory', {
    page,
    limit: 20,
    type: filters.value.type,
    credit_type: filters.value.creditType
  })
}

const getTypeIcon = (type) => {
  const icons = {
    add: 'mdi-plus-circle',
    deduct: 'mdi-minus-circle',
    renewal: 'mdi-refresh',
    bonus: 'mdi-gift'
  }
  return icons[type] || 'mdi-help-circle'
}

const getTypeColor = (type) => {
  const colors = {
    add: 'success',
    deduct: 'error',
    renewal: 'primary',
    bonus: 'orange'
  }
  return colors[type] || 'grey'
}

const getCreditTypeColor = (type) => {
  return type === 'plan' ? 'primary' : 'success'
}

const getCreditTypeLabel = (type) => {
  return type === 'plan' ? 'Plan' : 'Bonus'
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = dayjs(date)

  // Si es hoy, mostrar hora relativa
  if (d.isSame(dayjs(), 'day')) {
    return d.fromNow()
  }

  // Si es esta semana, mostrar día y hora
  if (d.isAfter(dayjs().subtract(7, 'days'))) {
    return d.format('dddd HH:mm')
  }

  // Sino, fecha completa
  return d.format('DD/MM/YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}
</style>
