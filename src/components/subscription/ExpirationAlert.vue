<template>
  <v-alert
    v-if="shouldShowAlert"
    :type="alertType"
    :variant="variant"
    :density="density"
    :prominent="prominent"
    :closable="closable"
    class="expiration-alert"
    :class="[`alert-${alertType}`, { 'alert-prominent': prominent }]"
  >
    <template v-slot:prepend>
      <v-icon :size="iconSize">{{ alertIcon }}</v-icon>
    </template>

    <template v-slot:title>
      <span class="font-weight-bold">{{ alertTitle }}</span>
    </template>

    <div class="alert-content">
      <p class="mb-2">{{ alertMessage }}</p>

      <div v-if="showDetails" class="alert-details mt-2">
        <div class="text-caption">
          <strong>Plan:</strong> {{ membership?.plan?.displayName || 'N/A' }}
        </div>
        <div class="text-caption">
          <strong>Vence:</strong> {{ formatDate(membership?.expiresAt) }}
        </div>
        <div class="text-caption">
          <strong>Días restantes:</strong>
          <span :class="getDaysRemainingClass">{{ membership?.daysRemaining || 0 }}</span>
        </div>
      </div>

      <v-btn
        v-if="showAction"
        :color="alertType"
        :variant="actionVariant"
        size="small"
        class="mt-3"
        @click="handleAction"
      >
        <v-icon left size="small">mdi-refresh</v-icon>
        {{ actionText }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()

const props = defineProps({
  membership: {
    type: Object,
    default: null
  },
  variant: {
    type: String,
    default: 'tonal', // 'flat', 'text', 'elevated', 'tonal', 'outlined', 'plain'
    validator: (value) => ['flat', 'text', 'elevated', 'tonal', 'outlined', 'plain'].includes(value)
  },
  density: {
    type: String,
    default: 'default', // 'default', 'comfortable', 'compact'
    validator: (value) => ['default', 'comfortable', 'compact'].includes(value)
  },
  prominent: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: false
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  showAction: {
    type: Boolean,
    default: true
  },
  actionText: {
    type: String,
    default: 'Renovar Ahora'
  },
  actionVariant: {
    type: String,
    default: 'elevated'
  },
  customRoute: {
    type: String,
    default: '/pricing'
  }
})

const emit = defineEmits(['action-click'])

// Computed properties
const shouldShowAlert = computed(() => {
  if (!props.membership) return false
  return props.membership.expiringSoon === true || props.membership.isExpired === true
})

const alertType = computed(() => {
  if (!props.membership) return 'info'

  const daysRemaining = props.membership.daysRemaining || 0

  if (props.membership.isExpired || daysRemaining <= 0) {
    return 'error'
  } else if (daysRemaining <= 7) {
    return 'error'
  } else if (daysRemaining <= 30) {
    return 'warning'
  }

  return 'info'
})

const alertIcon = computed(() => {
  const iconMap = {
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return iconMap[alertType.value] || 'mdi-information'
})

const iconSize = computed(() => {
  return props.prominent ? 'large' : 'default'
})

const alertTitle = computed(() => {
  if (!props.membership) return 'Información de Membresía'

  const daysRemaining = props.membership.daysRemaining || 0

  if (props.membership.isExpired || daysRemaining <= 0) {
    return '¡Tu membresía ha expirado!'
  } else if (daysRemaining <= 7) {
    return '¡Tu membresía está por vencer!'
  } else if (daysRemaining <= 30) {
    return 'Tu membresía vence pronto'
  }

  return 'Información de Membresía'
})

const alertMessage = computed(() => {
  if (!props.membership) return ''

  const daysRemaining = props.membership.daysRemaining || 0
  const planName = props.membership.plan?.displayName || 'tu plan'

  if (props.membership.isExpired || daysRemaining <= 0) {
    return `Tu membresía ${planName} ha expirado. Renueva ahora para seguir disfrutando de todas las funciones.`
  } else if (daysRemaining === 1) {
    return `Tu membresía ${planName} vence mañana. Renueva hoy para evitar interrupciones en el servicio.`
  } else if (daysRemaining <= 7) {
    return `Tu membresía ${planName} vence en ${daysRemaining} días. Renueva pronto para evitar interrupciones.`
  } else if (daysRemaining <= 30) {
    return `Tu membresía ${planName} vence en ${daysRemaining} días. Considera renovar para mantener acceso ininterrumpido.`
  }

  return ''
})

const getDaysRemainingClass = computed(() => {
  if (!props.membership) return ''

  const daysRemaining = props.membership.daysRemaining || 0

  if (daysRemaining <= 7) return 'text-error font-weight-bold'
  if (daysRemaining <= 30) return 'text-warning font-weight-bold'
  return 'text-success font-weight-bold'
})

// Methods
const formatDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('DD/MM/YYYY')
}

const handleAction = () => {
  emit('action-click')
  router.push(props.customRoute)
}
</script>

<style scoped>
.expiration-alert {
  transition: all 0.3s ease;
}

.alert-prominent {
  border-left: 4px solid currentColor;
}

.alert-error {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

.alert-content {
  line-height: 1.6;
}

.alert-details {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 8px;
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
