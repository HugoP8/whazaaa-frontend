<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
    <v-card rounded="xl" class="video-reward-card">
      <!-- Header -->
      <v-card-title class="pa-6 bg-gradient-success text-white">
        <v-icon class="mr-2" size="28">mdi-play-circle</v-icon>
        Ganar Créditos Gratis
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Estadísticas del día -->
        <v-card variant="tonal" color="primary" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption text-grey-darken-1">Videos vistos hoy</div>
                <div class="text-h5 font-weight-bold">
                  {{ stats.videosToday }} / {{ stats.maxVideosPerDay }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-darken-1">Créditos ganados</div>
                <div class="text-h5 font-weight-bold text-success">
                  +{{ stats.creditsToday }}
                </div>
              </div>
            </div>

            <!-- Barra de progreso -->
            <v-progress-linear
              :model-value="(stats.videosToday / stats.maxVideosPerDay) * 100"
              color="success"
              height="8"
              rounded
              class="mt-3"
            ></v-progress-linear>
          </v-card-text>
        </v-card>

        <!-- Estado de disponibilidad -->
        <v-alert
          v-if="!canWatch && reason"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <v-icon class="mr-2">mdi-clock-outline</v-icon>
          {{ reason }}
        </v-alert>

        <!-- Indicador de modo -->
        <v-alert
          v-if="adConfig.simulationMode && !videoPlaying && !videoCompleted"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <v-icon class="mr-2">mdi-information</v-icon>
          <strong>Modo Demo:</strong> Configura tus credenciales de Applixir para mostrar anuncios reales.
        </v-alert>

        <!-- Video Player Area -->
        <div v-if="canWatch && !videoCompleted" class="video-container mb-4">
          <div v-if="!videoPlaying" class="video-placeholder d-flex flex-column align-center justify-center">
            <v-icon size="64" color="success" class="mb-3">mdi-play-circle-outline</v-icon>
            <div class="text-h6 mb-2">Video Publicitario</div>
            <div class="text-caption text-grey mb-4">
              Mira el video completo para ganar {{ stats.creditsPerVideo }} crédito
            </div>
            <v-btn
              color="success"
              size="large"
              prepend-icon="mdi-play"
              @click="startVideo"
              :loading="loading"
            >
              Ver Video ({{ adConfig.simulationMode ? '30s simulado' : 'Anuncio' }})
            </v-btn>
          </div>

          <div v-else class="video-playing d-flex flex-column align-center justify-center">
            <v-progress-circular
              :model-value="videoProgress"
              :size="120"
              :width="10"
              color="success"
            >
              <div class="text-center">
                <div class="text-h4 font-weight-bold">{{ remainingSeconds }}</div>
                <div class="text-caption">segundos</div>
              </div>
            </v-progress-circular>

            <div class="text-body-1 mt-4 text-grey-darken-1">
              {{ adConfig.simulationMode ? 'Simulando video publicitario...' : 'Viendo anuncio...' }}
            </div>

            <v-alert type="info" variant="tonal" density="compact" class="mt-4" style="max-width: 300px">
              <div class="text-caption">
                No cierres esta ventana hasta que termine el video
              </div>
            </v-alert>
          </div>
        </div>

        <!-- Video Completado -->
        <div v-if="videoCompleted" class="text-center py-6">
          <v-icon size="80" color="success" class="mb-4 bounce-animation">
            mdi-check-circle
          </v-icon>
          <div class="text-h5 font-weight-bold text-success mb-2">
            +{{ earnedCredits }} Crédito{{ earnedCredits > 1 ? 's' : '' }}
          </div>
          <div class="text-body-1 text-grey-darken-1">
            Has ganado créditos por ver el video
          </div>

          <v-card variant="tonal" color="success" class="mt-4 mx-auto" style="max-width: 250px">
            <v-card-text class="pa-4 text-center">
              <div class="text-caption">Nuevo balance</div>
              <div class="text-h4 font-weight-bold">{{ newBalance }}</div>
              <div class="text-caption">créditos</div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Información adicional -->
        <v-expansion-panels v-if="!videoPlaying" variant="accordion" class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2" size="20">mdi-information-outline</v-icon>
              ¿Cómo funciona?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ul class="text-body-2 pl-4">
                <li class="mb-2">Mira videos publicitarios completos</li>
                <li class="mb-2">Gana <strong>{{ stats.creditsPerVideo }} crédito</strong> por cada video</li>
                <li class="mb-2">Máximo <strong>{{ stats.maxVideosPerDay }} videos</strong> por día</li>
                <li class="mb-2">Espera 5 minutos entre cada video</li>
                <li>Los créditos se acreditan inmediatamente</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="closeModal"
          :disabled="videoPlaying"
        >
          {{ videoCompleted ? 'Cerrar' : 'Cancelar' }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="videoCompleted && stats.videosRemaining > 0"
          color="success"
          variant="elevated"
          prepend-icon="mdi-play"
          @click="resetForNextVideo"
        >
          Ver otro video
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import api from '@/services/api'
import { showRewardedVideo, getAdConfig, loadApplixirSdk } from '@/services/adService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'credits-earned'])

const store = useStore()

// Estado
const loading = ref(false)
const canWatch = ref(false)
const reason = ref(null)
const videoPlaying = ref(false)
const videoCompleted = ref(false)
const videoProgress = ref(0)
const remainingSeconds = ref(30)
const earnedCredits = ref(0)
const newBalance = ref(0)
const adConfig = ref(getAdConfig())
let videoTimer = null

const stats = ref({
  videosToday: 0,
  creditsToday: 0,
  videosRemaining: 10,
  maxVideosPerDay: 10,
  creditsPerVideo: 1
})

// Métodos
const checkCanWatch = async () => {
  try {
    loading.value = true
    const response = await api.get('/video-rewards/can-watch')

    if (response.data.success) {
      canWatch.value = response.data.canWatch
      reason.value = response.data.reason

      stats.value = {
        videosToday: response.data.videosToday || 0,
        creditsToday: (response.data.videosToday || 0) * (response.data.creditsPerVideo || 1),
        videosRemaining: response.data.videosRemaining || 0,
        maxVideosPerDay: response.data.maxVideosPerDay || 10,
        creditsPerVideo: response.data.creditsPerVideo || 1
      }
    }
  } catch (error) {
    console.error('Error checking video availability:', error)
    canWatch.value = false
    reason.value = 'Error al verificar disponibilidad'
  } finally {
    loading.value = false
  }
}

const startVideo = async () => {
  videoPlaying.value = true
  videoProgress.value = 0
  remainingSeconds.value = 30

  // Actualizar configuración de anuncios
  adConfig.value = getAdConfig()

  if (adConfig.value.simulationMode) {
    // Modo simulación - contador visual
    videoTimer = setInterval(() => {
      remainingSeconds.value--
      videoProgress.value = ((30 - remainingSeconds.value) / 30) * 100

      if (remainingSeconds.value <= 0) {
        clearInterval(videoTimer)
        completeVideo()
      }
    }, 1000)
  } else {
    // Modo real - usar Applixir
    try {
      const result = await showRewardedVideo()

      if (result.reward) {
        // Usuario completó el video
        await completeVideo()
      } else {
        // Usuario cerró el video o hubo error
        videoPlaying.value = false
        if (result.error) {
          reason.value = result.error
        }
      }
    } catch (error) {
      console.error('Error showing ad:', error)
      videoPlaying.value = false
      reason.value = 'Error al mostrar el anuncio'
    }
  }
}

const completeVideo = async () => {
  if (videoTimer) {
    clearInterval(videoTimer)
  }
  videoPlaying.value = false

  try {
    loading.value = true
    const response = await api.post('/video-rewards/complete', {
      video_id: `video_${Date.now()}`,
      watch_duration: 30
    })

    if (response.data.success) {
      videoCompleted.value = true
      earnedCredits.value = response.data.creditsEarned
      newBalance.value = response.data.newBalance

      // Actualizar estadísticas
      stats.value.videosToday = response.data.videosToday
      stats.value.videosRemaining = response.data.videosRemaining
      stats.value.creditsToday += response.data.creditsEarned

      // Emitir evento para actualizar balance en el store
      emit('credits-earned', {
        credits: response.data.creditsEarned,
        newBalance: response.data.newBalance
      })

      // Actualizar store de créditos
      store.dispatch('credits/fetchBalance')
    }
  } catch (error) {
    console.error('Error completing video:', error)
    canWatch.value = false
    reason.value = error.response?.data?.error || 'Error al procesar recompensa'
  } finally {
    loading.value = false
  }
}

const resetForNextVideo = () => {
  videoCompleted.value = false
  videoPlaying.value = false
  videoProgress.value = 0
  remainingSeconds.value = 30
  checkCanWatch()
}

const closeModal = () => {
  if (videoTimer) {
    clearInterval(videoTimer)
  }
  videoPlaying.value = false
  videoCompleted.value = false
  emit('update:modelValue', false)
}

// Watch para cargar datos cuando se abre el modal
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    // Precargar SDK de anuncios
    try {
      await loadApplixirSdk()
      adConfig.value = getAdConfig()
    } catch (error) {
      console.warn('SDK de anuncios no disponible, usando modo simulación')
    }
    checkCanWatch()
  }
})

// Cleanup
onUnmounted(() => {
  if (videoTimer) {
    clearInterval(videoTimer)
  }
})
</script>

<style scoped>
.bg-gradient-success {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.video-container {
  min-height: 250px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 16px;
  overflow: hidden;
}

.video-placeholder,
.video-playing {
  min-height: 250px;
  padding: 24px;
}

.bounce-animation {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.video-reward-card {
  overflow: hidden;
}
</style>
