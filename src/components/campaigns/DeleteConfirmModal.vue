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
        <div class="icon-container error-icon">
          <v-icon
            size="32"
            color="error"
            class="icon-animated"
          >
            mdi-delete-alert
          </v-icon>
        </div>
        <div class="title-content">
          <h3 class="modal-title">Confirmar Eliminación</h3>
          <p class="modal-subtitle">Esta acción no se puede deshacer</p>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="modal-body py-6">
        <v-alert
          type="error"
          variant="tonal"
          class="mb-4"
          density="comfortable"
        >
          <v-icon start>mdi-alert-circle</v-icon>
          <strong>¿Estás seguro de que deseas eliminar esta campaña?</strong>
        </v-alert>

        <div class="campaign-info">
          <div class="info-row">
            <v-icon color="grey-darken-1" size="20">mdi-email</v-icon>
            <div class="info-content">
              <span class="info-label">Nombre de la campaña</span>
              <span class="info-value">{{ campaignName }}</span>
            </div>
          </div>

          <div class="info-row" v-if="totalRecipients">
            <v-icon color="grey-darken-1" size="20">mdi-account-multiple</v-icon>
            <div class="info-content">
              <span class="info-label">Destinatarios</span>
              <span class="info-value">{{ totalRecipients }}</span>
            </div>
          </div>

          <div class="info-row" v-if="status">
            <v-icon color="grey-darken-1" size="20">mdi-information</v-icon>
            <div class="info-content">
              <span class="info-label">Estado</span>
              <v-chip size="small" :color="getStatusColor(status)" variant="tonal">
                {{ status }}
              </v-chip>
            </div>
          </div>
        </div>

        <v-alert
          type="warning"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <v-icon start>mdi-information</v-icon>
          Se eliminarán todos los mensajes y datos asociados a esta campaña
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
          color="error"
          variant="flat"
          size="large"
          @click="handleConfirm"
          :loading="loading"
          class="action-btn-delete"
        >
          <v-icon start>mdi-delete</v-icon>
          Eliminar Campaña
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

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
  status: {
    type: String,
    default: ''
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

const getStatusColor = (status) => {
  const colors = {
    'COMPLETED': 'success',
    'IN_PROGRESS': 'info',
    'PENDING': 'warning',
    'FAILED': 'error',
    'CANCELLED': 'grey'
  }
  return colors[status] || 'grey'
}
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
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
  border-radius: 16px;
}

.error-icon {
  animation: iconShake 0.5s ease-in-out;
}

@keyframes iconShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
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

.campaign-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-row:first-child {
  padding-top: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.info-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
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

.action-btn-delete {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transition: all 0.2s ease;
}

.action-btn-delete:hover {
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-header {
    flex-direction: column;
    text-align: center;
  }

  .icon-container {
    margin: 0 auto;
  }

  .campaign-info {
    padding: 12px;
  }

  .info-row {
    padding: 8px 0;
  }
}
</style>
