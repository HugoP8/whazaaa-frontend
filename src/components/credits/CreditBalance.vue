<template>
  <v-card :elevation="elevation" :rounded="rounded" :class="['credit-balance-card', { 'low-credits': isLowCredits }]">
    <v-card-text class="pa-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-caption text-grey mb-1">Tu Plan Actual</div>
          <div class="text-h6 font-weight-bold">
            <v-icon :color="getPlanColor()" class="mr-2">{{ getPlanIcon() }}</v-icon>
            {{ planDisplayName }}
          </div>
        </div>

        <v-btn
          v-if="showRechargeButton"
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus-circle"
          @click="$emit('recharge')"
        >
          Recargar
        </v-btn>
      </div>

      <!-- Barra de progreso de créditos -->
      <div class="mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2 font-weight-medium">Créditos Disponibles</span>
          <span class="text-h5 font-weight-bold" :class="getCreditsColorClass()">
            {{ totalCredits }}
          </span>
        </div>

        <v-progress-linear
          :model-value="getProgressPercentage()"
          :color="getProgressColor()"
          height="12"
          rounded
          class="mb-2"
        ></v-progress-linear>

        <div class="text-caption text-grey">
          <span v-if="planCredits > 0">{{ planCredits }} del plan</span>
          <span v-if="planCredits > 0 && bonusCredits > 0"> + </span>
          <span v-if="bonusCredits > 0">{{ bonusCredits }} bonus</span>
        </div>
      </div>

      <!-- Desglose de créditos -->
      <v-row dense class="mb-3">
        <v-col cols="6">
          <v-card variant="tonal" color="primary" rounded="lg">
            <v-card-text class="pa-3 text-center">
              <v-icon size="20" class="mb-1">mdi-package-variant</v-icon>
              <div class="text-caption">Plan</div>
              <div class="text-h6 font-weight-bold">{{ planCredits }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6">
          <v-card variant="tonal" color="success" rounded="lg">
            <v-card-text class="pa-3 text-center">
              <v-icon size="20" class="mb-1">mdi-gift</v-icon>
              <div class="text-caption">Bonus</div>
              <div class="text-h6 font-weight-bold">{{ bonusCredits }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Alerta de créditos bajos -->
      <v-alert
        v-if="isLowCredits"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-0"
      >
        <template v-slot:prepend>
          <v-icon>mdi-alert</v-icon>
        </template>
        <div class="text-body-2">
          <strong>Créditos bajos!</strong> Te quedan solo {{ totalCredits }} créditos.
          {{ planName === 'flex' ? 'Contacta a tu vendedor para recargar.' : 'Considera recargar o cambiar a un plan superior.' }}
        </div>
      </v-alert>

      <!-- Info adicional para plan Flex -->
      <v-alert
        v-if="planName === 'flex'"
        type="info"
        variant="tonal"
        density="compact"
        class="mt-3 mb-0"
      >
        <div class="text-body-2">
          Estás en modo <strong>recarga</strong>. Suscríbete y ahorra hasta <strong>40%</strong> por crédito.
        </div>
      </v-alert>

      <!-- Acción rápida -->
      <div v-if="showActions" class="mt-4 d-flex gap-2">
        <v-btn
          variant="outlined"
          color="primary"
          block
          prepend-icon="mdi-history"
          @click="$emit('view-history')"
        >
          Ver Historial
        </v-btn>
        <v-btn
          v-if="planName === 'flex'"
          variant="elevated"
          color="success"
          block
          prepend-icon="mdi-crown"
          @click="$emit('upgrade-plan')"
        >
          Suscribirme
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalCredits: {
    type: Number,
    default: 0
  },
  planCredits: {
    type: Number,
    default: 0
  },
  bonusCredits: {
    type: Number,
    default: 0
  },
  planName: {
    type: String,
    default: 'free'
  },
  planDisplayName: {
    type: String,
    default: 'Gratuito'
  },
  maxCredits: {
    type: Number,
    default: 30
  },
  showRechargeButton: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  elevation: {
    type: [Number, String],
    default: 2
  },
  rounded: {
    type: String,
    default: 'xl'
  }
})

defineEmits(['recharge', 'view-history', 'upgrade-plan'])

const isLowCredits = computed(() => props.totalCredits <= 5)

const getProgressPercentage = () => {
  if (props.planName === 'flex') {
    // Para Flex, mostrar simplemente el total
    return Math.min((props.totalCredits / Math.max(props.totalCredits, 10)) * 100, 100)
  }
  // Para planes con cuota, mostrar contra el máximo del plan
  return Math.min((props.totalCredits / props.maxCredits) * 100, 100)
}

const getProgressColor = () => {
  const percentage = getProgressPercentage()
  if (percentage <= 20) return 'error'
  if (percentage <= 40) return 'warning'
  return 'success'
}

const getCreditsColorClass = () => {
  if (props.totalCredits <= 5) return 'text-error'
  if (props.totalCredits <= 15) return 'text-warning'
  return 'text-success'
}

const getPlanColor = () => {
  const colors = {
    free: 'grey',
    pro: 'primary',
    business: 'purple',
    flex: 'orange'
  }
  return colors[props.planName] || 'grey'
}

const getPlanIcon = () => {
  const icons = {
    free: 'mdi-gift',
    pro: 'mdi-account-star',
    business: 'mdi-domain',
    flex: 'mdi-lightning-bolt'
  }
  return icons[props.planName] || 'mdi-crown'
}
</script>

<style scoped>
.credit-balance-card {
  transition: all 0.3s ease;
}

.credit-balance-card.low-credits {
  border: 2px solid #ff9800;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 152, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 152, 0, 0.6);
  }
}
</style>
