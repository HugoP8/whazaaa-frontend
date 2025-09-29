<template>
  <div class="campaign-progress">
    <v-card v-if="progress" class="mb-4" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" color="primary">mdi-chart-line</v-icon>
        Progreso de Campaña
      </v-card-title>

      <v-card-text>
        <div class="progress-info mb-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-1">{{ progress.sent || 0 }} / {{ progress.total || 0 }} enviados</span>
            <span class="text-h6 font-weight-bold" :class="getProgressColor()">
              {{ Math.round(progress.percentage || 0) }}%
            </span>
          </div>

          <v-progress-linear
            :model-value="progress.percentage || 0"
            height="8"
            :color="getProgressColor()"
            background-color="grey-lighten-3"
            rounded
          />
        </div>

        <div class="progress-details">
          <v-row>
            <v-col cols="6">
              <div class="text-center">
                <v-icon color="success" class="mb-1">mdi-check-circle</v-icon>
                <div class="text-caption">Exitosos</div>
                <div class="text-h6 font-weight-bold text-success">
                  {{ progress.success || 0 }}
                </div>
              </div>
            </v-col>

            <v-col cols="6">
              <div class="text-center">
                <v-icon color="error" class="mb-1">mdi-alert-circle</v-icon>
                <div class="text-caption">Fallidos</div>
                <div class="text-h6 font-weight-bold text-error">
                  {{ progress.failed || 0 }}
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <div v-if="progress.timestamp" class="text-caption text-grey mt-2">
          Última actualización: {{ formatTimestamp(progress.timestamp) }}
        </div>

        <div v-if="progress.estimatedTimeRemaining" class="text-caption text-grey mt-1">
          Tiempo estimado restante: {{ formatDuration(progress.estimatedTimeRemaining) }}
        </div>
      </v-card-text>

      <v-card-actions v-if="showActions">
        <v-spacer />
        <v-btn
          v-if="canPause"
          variant="outlined"
          color="orange"
          @click="$emit('pause')"
        >
          <v-icon start>mdi-pause</v-icon>
          Pausar
        </v-btn>

        <v-btn
          v-if="canResume"
          variant="outlined"
          color="primary"
          @click="$emit('resume')"
        >
          <v-icon start>mdi-play</v-icon>
          Reanudar
        </v-btn>

        <v-btn
          v-if="canCancel"
          variant="outlined"
          color="error"
          @click="$emit('cancel')"
        >
          <v-icon start>mdi-stop</v-icon>
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-alert
      v-if="!progress && showEmptyState"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      <v-icon start>mdi-information</v-icon>
      No hay campañas ejecutándose actualmente
    </v-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CampaignProgress',

  props: {
    showActions: {
      type: Boolean,
      default: true
    },
    showEmptyState: {
      type: Boolean,
      default: true
    },
    canPause: {
      type: Boolean,
      default: true
    },
    canResume: {
      type: Boolean,
      default: true
    },
    canCancel: {
      type: Boolean,
      default: true
    }
  },

  emits: ['pause', 'resume', 'cancel'],

  computed: {
    ...mapGetters('whatsapp', ['campaignProgress']),

    progress() {
      return this.campaignProgress
    }
  },

  methods: {
    getProgressColor() {
      if (!this.progress) return 'primary'

      const percentage = this.progress.percentage || 0
      if (percentage < 25) return 'error'
      if (percentage < 50) return 'warning'
      if (percentage < 75) return 'info'
      return 'success'
    },

    formatTimestamp(timestamp) {
      try {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return timestamp
      }
    },

    formatDuration(seconds) {
      if (!seconds) return 'Calculando...'

      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
      } else {
        return `${secs}s`
      }
    },

    updateProgressBar(percentage) {
      if (this.progress) {
        this.progress.percentage = percentage
      }
    },

    updateProgressText(text) {
      console.log('Progress text:', text)
    }
  },

  mounted() {
    // Escuchar eventos de progreso via socket
    const socket = this.$store.state.whatsapp.socket
    if (socket) {
      socket.on('campaign-progress', (data) => {
        console.log('Campaign progress received:', data)
        this.updateProgressBar(data.percentage)
        this.updateProgressText(`${data.sent}/${data.total} enviados`)
      })
    }
  },

  beforeUnmount() {
    // Limpiar listeners
    const socket = this.$store.state.whatsapp.socket
    if (socket) {
      socket.off('campaign-progress')
    }
  }
}
</script>

<style scoped>
.campaign-progress {
  width: 100%;
}

.progress-info {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 16px;
  border-radius: 8px;
}

.progress-details {
  margin-top: 16px;
}

.text-success {
  color: rgb(var(--v-theme-success)) !important;
}

.text-error {
  color: rgb(var(--v-theme-error)) !important;
}
</style>