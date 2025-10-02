<template>
  <v-dialog
    v-model="internalShow"
    max-width="500"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card
      rounded="xl"
      class="modern-modal"
      elevation="24"
    >
      <!-- Header con animación -->
      <v-card-title class="modal-header d-flex align-center">
        <div class="icon-container">
          <v-icon
            size="32"
            color="warning"
            class="icon-animated"
          >
            mdi-send-check
          </v-icon>
        </div>
        <div class="title-content">
          <h3 class="modal-title">Confirmar Reenvío de Campaña</h3>
          <p class="modal-subtitle">Esta acción reenviará la campaña a todos los destinatarios</p>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="modal-body py-6">
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
          density="comfortable"
        >
          <v-icon start>mdi-information</v-icon>
          <strong>Campaña:</strong> {{ campaignName }}
        </v-alert>

        <div class="info-grid">
          <div class="info-item">
            <v-icon color="primary" size="20">mdi-account-multiple</v-icon>
            <div class="info-text">
              <span class="info-label">Destinatarios</span>
              <span class="info-value">{{ totalRecipients }}</span>
            </div>
          </div>

          <div class="info-item">
            <v-icon color="success" size="20">mdi-check-circle</v-icon>
            <div class="info-text">
              <span class="info-label">Enviados anteriormente</span>
              <span class="info-value">{{ sentCount }}</span>
            </div>
          </div>
        </div>

        <v-alert
          type="warning"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <v-icon start>mdi-alert</v-icon>
          Esta acción duplicará los mensajes a los destinatarios que ya recibieron el mensaje
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions con mejor diseño -->
      <v-card-actions class="modal-actions pa-4">
        <v-btn
          variant="text"
          size="large"
          @click="handleCancel"
          :disabled="loading"
          class="action-btn-cancel"
        >
          Cancelar
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="handleConfirm"
          :loading="loading"
          class="action-btn-confirm"
        >
          <v-icon start>mdi-send</v-icon>
          Reenviar Campaña
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  campaignName: {
    type: String,
    default: ''
  },
  totalRecipients: {
    type: Number,
    default: 0
  },
  sentCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const internalShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  internalShow.value = false
}

// Animación al abrir el modal
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modern-modal {
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 24px;
  gap: 16px;
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.02) 100%);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(37, 211, 102, 0.05));
  border-radius: 16px;
}

.icon-animated {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.title-content {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  margin-bottom: 4px;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.modal-body {
  background: #fafafa;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(37, 211, 102, 0.1);
  transition: all 0.2s ease;
}

.info-item:hover {
  border-color: rgba(37, 211, 102, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.1);
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-actions {
  background: white;
}

.action-btn-cancel {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.2s ease;
}

.action-btn-cancel:hover {
  background: rgba(0, 0, 0, 0.04);
}

.action-btn-confirm {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
  transition: all 0.2s ease;
}

.action-btn-confirm:hover {
  box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    flex-direction: column;
    text-align: center;
  }

  .icon-container {
    margin: 0 auto;
  }
}
</style>