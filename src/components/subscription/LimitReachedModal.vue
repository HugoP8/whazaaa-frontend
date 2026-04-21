<template>
  <v-dialog
    v-model="localShow"
    max-width="600"
    persistent
  >
    <v-card rounded="xl">
      <v-card-title class="pa-6 bg-warning">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">mdi-alert</v-icon>
          <span>Límite Alcanzado</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Error Message -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-body-1 font-weight-bold mb-2">
            {{ errorMessage }}
          </div>
          <div class="text-body-2">
            {{ getDetailedMessage() }}
          </div>
        </v-alert>

        <!-- Usage Stats -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption text-grey mb-1">Has usado</div>
                  <div class="text-h5 font-weight-bold text-warning">
                    {{ current }}
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption text-grey mb-1">De un límite de</div>
                  <div class="text-h5 font-weight-bold text-primary">
                    {{ limit }}
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-progress-linear
              :model-value="100"
              color="warning"
              height="10"
              rounded
              class="mt-3"
            ></v-progress-linear>
          </v-card-text>
        </v-card>

        <!-- Current Plan Info -->
        <v-card variant="tonal" color="grey-lighten-4" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon color="grey-darken-2" class="mr-3">mdi-information</v-icon>
              <div>
                <div class="text-caption text-grey">Plan actual</div>
                <div class="text-h6 font-weight-bold text-capitalize">
                  {{ planName }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Upgrade Message -->
        <div class="text-center mb-4">
          <v-icon color="primary" size="64" class="mb-2">mdi-rocket-launch</v-icon>
          <h3 class="text-h6 mb-2">¡Actualiza tu plan para continuar!</h3>
          <p class="text-body-2 text-grey">
            Obtén más mensajes, campañas ilimitadas y características premium
          </p>
        </div>

        <!-- Benefits List -->
        <v-list density="compact" class="bg-transparent">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Más mensajes diarios y mensuales
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Campañas y contactos ilimitados
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Múltiples cuentas de WhatsApp
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Reportes avanzados y soporte prioritario
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="close"
        >
          Cerrar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          size="large"
          prepend-icon="mdi-crown"
          @click="upgradePlan"
        >
          Ver Planes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  errorData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// Computed
const localShow = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const errorMessage = computed(() => {
  return props.errorData?.error || 'Has alcanzado tu límite'
})

const current = computed(() => {
  return props.errorData?.current || 0
})

const limit = computed(() => {
  return props.errorData?.limit || 0
})

const planName = computed(() => {
  return props.errorData?.plan || 'free'
})

const errorCode = computed(() => {
  return props.errorData?.code || ''
})

// Métodos
const getDetailedMessage = () => {
  const code = errorCode.value

  switch (code) {
    case 'DAILY_LIMIT_REACHED':
      return 'Has alcanzado tu límite de mensajes diarios. Actualiza tu plan para seguir enviando mensajes hoy.'
    case 'MONTHLY_LIMIT_REACHED':
      return 'Has alcanzado tu límite de mensajes mensuales. Actualiza tu plan para continuar.'
    case 'CAMPAIGNS_LIMIT_REACHED':
      return 'Has alcanzado el límite de campañas activas. Actualiza tu plan para crear más campañas.'
    case 'ACCOUNTS_LIMIT_REACHED':
      return 'Has alcanzado el límite de cuentas de WhatsApp. Actualiza tu plan para conectar más cuentas.'
    case 'CONTACTS_LIMIT_REACHED':
      return 'Has alcanzado el límite de contactos. Actualiza tu plan para agregar más contactos.'
    case 'NO_SUBSCRIPTION':
      return 'No tienes una suscripción activa. Selecciona un plan para comenzar a usar la plataforma.'
    default:
      return 'Has alcanzado un límite de tu plan actual. Actualiza para continuar sin restricciones.'
  }
}

const close = () => {
  emit('close')
}

const upgradePlan = () => {
  router.push('/pricing')
  close()
}
</script>

<style scoped>
.bg-warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.v-progress-linear {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
