<template>
  <v-chip
    :color="planColor"
    :variant="variant"
    :size="size"
    :class="['membership-badge', { 'badge-elevated': elevated }]"
  >
    <v-icon v-if="showIcon" :size="iconSize" class="mr-1">
      {{ planIcon }}
    </v-icon>
    <span class="badge-text">{{ displayName }}</span>
  </v-chip>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  planName: {
    type: String,
    default: 'free'
  },
  displayName: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: 'default', // 'x-small', 'small', 'default', 'large', 'x-large'
    validator: (value) => ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
  },
  variant: {
    type: String,
    default: 'elevated', // 'flat', 'text', 'elevated', 'tonal', 'outlined', 'plain'
    validator: (value) => ['flat', 'text', 'elevated', 'tonal', 'outlined', 'plain'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  elevated: {
    type: Boolean,
    default: false
  }
})

// Mapeo de colores según el plan
const planColorMap = {
  free: 'grey',
  basic: 'blue',
  pro: 'purple',
  premium: 'orange',
  enterprise: 'red',
  starter: 'cyan',
  professional: 'indigo',
  business: 'deep-purple'
}

// Mapeo de iconos según el plan
const planIconMap = {
  free: 'mdi-account',
  basic: 'mdi-star-outline',
  pro: 'mdi-star',
  premium: 'mdi-crown',
  enterprise: 'mdi-diamond',
  starter: 'mdi-rocket-launch-outline',
  professional: 'mdi-briefcase',
  business: 'mdi-office-building'
}

// Computed properties
const planColor = computed(() => {
  return planColorMap[props.planName.toLowerCase()] || 'grey'
})

const planIcon = computed(() => {
  return planIconMap[props.planName.toLowerCase()] || 'mdi-tag'
})

const iconSize = computed(() => {
  const sizeMap = {
    'x-small': 'x-small',
    'small': 'small',
    'default': 'default',
    'large': 'large',
    'x-large': 'x-large'
  }
  return sizeMap[props.size] || 'default'
})
</script>

<style scoped>
.membership-badge {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.badge-elevated {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.membership-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.badge-text {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
