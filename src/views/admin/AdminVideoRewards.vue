<template>
  <div class="admin-video-rewards">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">
              <v-icon class="mr-2" color="success">mdi-play-circle</v-icon>
              Video Rewards
            </h1>
            <p class="text-body-1 text-grey mt-1">
              Configura las recompensas por ver videos publicitarios
            </p>
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-refresh"
            @click="loadData"
            :loading="loading"
          >
            Actualizar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Estadísticas Generales -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="stat-card">
          <v-card-text class="text-center pa-5">
            <v-icon color="primary" size="48" class="mb-3">mdi-account-group</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.general?.unique_users || 0 }}</div>
            <div class="text-caption text-grey mt-1">Usuarios Activos</div>
            <div class="text-caption text-grey-darken-1">Últimos 30 días</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="stat-card">
          <v-card-text class="text-center pa-5">
            <v-icon color="success" size="48" class="mb-3">mdi-play-box-multiple</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.general?.total_videos || 0 }}</div>
            <div class="text-caption text-grey mt-1">Videos Vistos</div>
            <div class="text-caption text-grey-darken-1">Total acumulado</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="stat-card">
          <v-card-text class="text-center pa-5">
            <v-icon color="warning" size="48" class="mb-3">mdi-lightning-bolt</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.general?.total_credits_given || 0 }}</div>
            <div class="text-caption text-grey mt-1">Créditos Otorgados</div>
            <div class="text-caption text-grey-darken-1">Total regalado</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl" class="stat-card">
          <v-card-text class="text-center pa-5">
            <v-icon color="info" size="48" class="mb-3">mdi-currency-usd</v-icon>
            <div class="text-h4 font-weight-bold">$0.00</div>
            <div class="text-caption text-grey mt-1">Revenue Estimado</div>
            <div class="text-caption text-grey-darken-1">Por anuncios</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Configuración -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6 bg-gradient-success text-white">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Configuración de Recompensas
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="configForm">
              <v-text-field
                v-model.number="config.credits_per_video"
                label="Créditos por video"
                prepend-inner-icon="mdi-lightning-bolt"
                variant="outlined"
                type="number"
                min="1"
                max="10"
                hint="Créditos que recibe el usuario por cada video visto"
                persistent-hint
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model.number="config.max_videos_per_day"
                label="Máximo videos por día"
                prepend-inner-icon="mdi-counter"
                variant="outlined"
                type="number"
                min="1"
                max="50"
                hint="Límite de videos que otorgan créditos por día"
                persistent-hint
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model.number="config.min_watch_seconds"
                label="Segundos mínimos de visualización"
                prepend-inner-icon="mdi-timer"
                variant="outlined"
                type="number"
                min="5"
                max="120"
                hint="Tiempo mínimo que debe ver el video"
                persistent-hint
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model.number="config.cooldown_minutes"
                label="Tiempo de espera entre videos"
                prepend-inner-icon="mdi-clock-outline"
                variant="outlined"
                type="number"
                min="1"
                max="60"
                suffix="minutos"
                hint="Cooldown entre videos"
                persistent-hint
                class="mb-4"
              ></v-text-field>

              <v-switch
                v-model="config.enabled"
                label="Sistema activo"
                color="success"
                hint="Activar o desactivar el sistema de recompensas"
                persistent-hint
              ></v-switch>

              <v-btn
                color="success"
                variant="elevated"
                block
                class="mt-6"
                prepend-icon="mdi-content-save"
                :loading="saving"
                @click="saveConfig"
              >
                Guardar Configuración
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Usuarios -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6 bg-gradient-primary text-white">
            <v-icon class="mr-2">mdi-trophy</v-icon>
            Top Usuarios
          </v-card-title>

          <v-card-text class="pa-0">
            <v-list v-if="stats.topUsers && stats.topUsers.length > 0">
              <v-list-item
                v-for="(user, index) in stats.topUsers"
                :key="user.id"
                class="px-6 py-3"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getMedalColor(index)" size="40" class="mr-3">
                    <span class="text-h6 font-weight-bold text-white">{{ index + 1 }}</span>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ user.name || user.email }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ user.email }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="text-right">
                    <div class="text-h6 font-weight-bold text-success">{{ user.videos_watched }}</div>
                    <div class="text-caption text-grey">videos</div>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <div v-else class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1">mdi-trophy-outline</v-icon>
              <p class="text-body-1 text-grey mt-4">No hay datos disponibles</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráfico de actividad por día -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            Actividad Diaria (Últimos 30 días)
          </v-card-title>

          <v-card-text class="pa-6">
            <v-row v-if="stats.daily && stats.daily.length > 0">
              <v-col
                v-for="day in stats.daily.slice(0, 14)"
                :key="day.date"
                cols="6"
                sm="4"
                md="3"
                lg="2"
              >
                <v-card variant="tonal" color="success" rounded="lg">
                  <v-card-text class="text-center pa-3">
                    <div class="text-caption text-grey mb-1">
                      {{ formatDate(day.date) }}
                    </div>
                    <div class="text-h6 font-weight-bold">{{ day.videos }}</div>
                    <div class="text-caption">videos</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-alert v-else type="info" variant="tonal">
              No hay actividad registrada en los últimos 30 días
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Información de integración -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-information</v-icon>
            Integración con AdSense / AdMob
          </v-card-title>

          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="text-body-2">
                Para monetizar los videos, necesitas integrar Google AdSense (web) o AdMob (móvil).
                Configura tus credenciales en las variables de entorno.
              </div>
            </v-alert>

            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="mr-2">mdi-google</v-icon>
                  Configuración de Google AdSense
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <pre class="text-caption bg-grey-lighten-4 pa-4 rounded">
# Variables de entorno requeridas (.env)
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
GOOGLE_ADSENSE_SLOT_VIDEO=XXXXXXXXXX
GOOGLE_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXX

# Endpoints de monetización
POST /api/ads/track-impression
POST /api/ads/track-click
GET /api/ads/revenue (admin)
                  </pre>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import videoRewardsService from '@/services/videoRewardsService'

const toast = useToast()

// Estado
const loading = ref(false)
const saving = ref(false)

const config = ref({
  credits_per_video: 1,
  max_videos_per_day: 10,
  min_watch_seconds: 30,
  cooldown_minutes: 5,
  enabled: true
})

const stats = ref({
  general: {},
  daily: [],
  topUsers: []
})

// Métodos
const loadData = async () => {
  loading.value = true
  try {
    // Cargar configuración
    const configResponse = await videoRewardsService.adminGetConfig()
    if (configResponse.success) {
      configResponse.config.forEach(cfg => {
        if (cfg.config_key === 'enabled') {
          config.value[cfg.config_key] = cfg.config_value === 'true'
        } else {
          config.value[cfg.config_key] = parseInt(cfg.config_value) || cfg.config_value
        }
      })
    }

    // Cargar estadísticas
    const statsResponse = await videoRewardsService.adminGetStats(30)
    if (statsResponse.success) {
      stats.value = statsResponse.stats
    }
  } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    const configs = [
      { key: 'credits_per_video', value: String(config.value.credits_per_video) },
      { key: 'max_videos_per_day', value: String(config.value.max_videos_per_day) },
      { key: 'min_watch_seconds', value: String(config.value.min_watch_seconds) },
      { key: 'cooldown_minutes', value: String(config.value.cooldown_minutes) },
      { key: 'enabled', value: config.value.enabled ? 'true' : 'false' }
    ]

    await videoRewardsService.adminUpdateConfig(configs)
    toast.success('Configuración guardada')
  } catch (error) {
    console.error('Error saving config:', error)
    toast.error('Error al guardar configuración')
  } finally {
    saving.value = false
  }
}

const getMedalColor = (index) => {
  const colors = ['amber-darken-1', 'grey-lighten-1', 'orange-darken-3']
  return colors[index] || 'primary'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-video-rewards {
  max-width: 1600px;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  color: white !important;
}

.bg-gradient-success :deep(*) {
  color: white !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white !important;
}

.bg-gradient-primary :deep(*) {
  color: white !important;
}

.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Mejoras en lista top usuarios */
:deep(.v-list-item:hover) {
  background: #f8fafc;
}

/* Inputs mantener colores legibles */
:deep(.v-field__input) {
  color: rgba(0, 0, 0, 0.87) !important;
}

/* Fix for expansion panels text */
:deep(.v-expansion-panel-text__wrapper) {
  color: rgba(0, 0, 0, 0.87);
}
</style>
