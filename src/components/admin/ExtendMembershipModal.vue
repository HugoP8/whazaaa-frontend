<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card rounded="xl">
      <v-card-title class="pa-6 bg-primary text-white">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar-plus</v-icon>
          <span>Extender Membresía</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- User Info -->
        <v-alert
          v-if="user"
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          <div class="text-body-2">
            <strong>Usuario:</strong> {{ user.name || user.email }}
          </div>
          <div class="text-body-2" v-if="user.plan_display_name">
            <strong>Plan Actual:</strong> {{ user.plan_display_name }}
          </div>
          <div class="text-body-2" v-if="user.subscription_expires">
            <strong>Vence:</strong> {{ formatDate(user.subscription_expires) }}
          </div>
          <div class="text-body-2" v-if="user.days_remaining !== undefined">
            <strong>Días Restantes:</strong>
            <span :class="getDaysRemainingClass(user.days_remaining)">
              {{ user.days_remaining }} días
            </span>
          </div>
        </v-alert>

        <!-- Days Input -->
        <v-text-field
          v-model.number="days"
          type="number"
          label="Días a extender"
          :min="1"
          :max="365"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-calendar-clock"
          hint="Ingresa un número entre 1 y 365 días"
          persistent-hint
          :error-messages="daysError"
          @input="validateDays"
        >
          <template v-slot:append-inner>
            <v-chip
              size="small"
              color="primary"
              variant="tonal"
            >
              días
            </v-chip>
          </template>
        </v-text-field>

        <!-- Quick Actions -->
        <div class="mt-4">
          <div class="text-caption text-grey mb-2">Accesos rápidos:</div>
          <div class="d-flex gap-2 flex-wrap">
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 7"
            >
              7 días
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 15"
            >
              15 días
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 30"
            >
              1 mes
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 90"
            >
              3 meses
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 180"
            >
              6 meses
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="days = 365"
            >
              1 año
            </v-btn>
          </div>
        </div>

        <!-- Preview -->
        <v-alert
          v-if="days && days > 0 && days <= 365"
          type="success"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <div class="text-caption">
            <strong>Nueva fecha de vencimiento:</strong><br>
            {{ calculateNewExpiryDate() }}
          </div>
        </v-alert>

        <!-- Warning -->
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <div class="text-caption">
            ⚠️ Esta acción extenderá la membresía del usuario. Asegúrate de verificar la información antes de confirmar.
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="confirm"
          :loading="loading"
          :disabled="!isValid"
        >
          <v-icon left size="small">mdi-check</v-icon>
          Extender
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// Estado
const days = ref(30)
const daysError = ref('')

// Computed
const isValid = computed(() => {
  return days.value && days.value >= 1 && days.value <= 365 && !daysError.value
})

// Methods
const validateDays = () => {
  if (!days.value) {
    daysError.value = 'Este campo es requerido'
  } else if (days.value < 1) {
    daysError.value = 'Debe ser al menos 1 día'
  } else if (days.value > 365) {
    daysError.value = 'No puede ser más de 365 días'
  } else {
    daysError.value = ''
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('DD/MM/YYYY')
}

const getDaysRemainingClass = (daysRemaining) => {
  if (daysRemaining <= 7) return 'text-error font-weight-bold'
  if (daysRemaining <= 30) return 'text-warning font-weight-bold'
  return 'text-success font-weight-bold'
}

const calculateNewExpiryDate = () => {
  if (!days.value || days.value < 1 || days.value > 365) return 'N/A'

  let baseDate
  if (props.user?.subscription_expires) {
    baseDate = dayjs(props.user.subscription_expires)
  } else {
    baseDate = dayjs()
  }

  const newDate = baseDate.add(days.value, 'day')
  return newDate.format('DD/MM/YYYY HH:mm')
}

const close = () => {
  emit('update:modelValue', false)
  // Reset
  days.value = 30
  daysError.value = ''
}

const confirm = () => {
  if (isValid.value) {
    emit('confirm', days.value)
  }
}

// Watch para validar cuando cambie el modelo
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // Reset al abrir
    days.value = 30
    daysError.value = ''
  }
})
</script>

<style scoped>
.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.gap-2 {
  gap: 8px;
}

.text-error {
  color: #ef5350;
}

.text-warning {
  color: #ff9800;
}

.text-success {
  color: #4caf50;
}
</style>
