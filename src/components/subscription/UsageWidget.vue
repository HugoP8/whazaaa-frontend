<template>
  <v-card elevation="2" rounded="xl" class="usage-widget">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
      <span>Uso de Mensajes</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        variant="text"
        @click="loadUsage"
        :loading="loading"
      >
        <v-icon size="small">mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <template v-if="loading && !usage.daily">
        <v-skeleton-loader type="text" class="mb-2"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="text"></v-skeleton-loader>
      </template>

      <template v-else-if="usage.daily && usage.monthly">
        <!-- Daily Usage -->
        <div class="mb-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption font-weight-bold">Hoy</span>
            <span class="text-caption text-grey">
              {{ usage.daily.sent }} / {{ usage.daily.limit }}
            </span>
          </div>

          <v-progress-linear
            :model-value="usage.daily.percentage"
            :color="getUsageColor(usage.daily.percentage)"
            height="8"
            rounded
            class="mini-bar"
          ></v-progress-linear>

          <div class="text-caption text-grey mt-1">
            {{ usage.daily.remaining }} restantes
          </div>
        </div>

        <!-- Monthly Usage -->
        <div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption font-weight-bold">Este mes</span>
            <span class="text-caption text-grey">
              {{ usage.monthly.sent }} / {{ usage.monthly.limit }}
            </span>
          </div>

          <v-progress-linear
            :model-value="usage.monthly.percentage"
            :color="getUsageColor(usage.monthly.percentage)"
            height="8"
            rounded
            class="mini-bar"
          ></v-progress-linear>

          <div class="text-caption text-grey mt-1">
            {{ usage.monthly.remaining }} restantes
          </div>
        </div>

        <!-- Warning Alert -->
        <v-alert
          v-if="usage.daily.percentage >= 80 || usage.monthly.percentage >= 80"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-3"
        >
          <div class="text-caption">
            Te estás acercando al límite
          </div>
        </v-alert>

        <!-- Action Button -->
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          block
          class="mt-3"
          @click="$router.push('/subscription')"
        >
          Ver Detalles
        </v-btn>
      </template>

      <template v-else>
        <div class="text-center text-grey py-4">
          <v-icon size="32" color="grey-lighten-1">mdi-information-outline</v-icon>
          <p class="text-caption mt-2">No hay datos de uso</p>
          <v-btn
            size="x-small"
            color="primary"
            variant="text"
            @click="loadUsage"
          >
            Cargar
          </v-btn>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { subscriptionService } from '@/services/subscriptionService'

const router = useRouter()

// Estado
const loading = ref(false)
const usage = ref({})

// Métodos
const getUsageColor = (percentage) => {
  if (percentage >= 90) return 'error'
  if (percentage >= 80) return 'warning'
  if (percentage >= 60) return 'orange'
  return 'success'
}

const loadUsage = async () => {
  try {
    loading.value = true

    const response = await subscriptionService.getMySubscription()

    if (response.success) {
      usage.value = response.usage || {}
    }
  } catch (error) {
    console.error('Error loading usage:', error)
    // No mostrar error si no está autenticado
    if (error.response?.status !== 401) {
      usage.value = {}
    }
  } finally {
    loading.value = false
  }
}

// Computed
const dailyPercentage = computed(() => {
  return usage.value.daily?.percentage || 0
})

// Lifecycle
onMounted(() => {
  loadUsage()
})
</script>

<style scoped>
.usage-widget {
  height: 100%;
  transition: all 0.3s ease;
}

.usage-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.15) !important;
}

.mini-bar {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .usage-widget:hover {
    transform: none;
  }
}
</style>
