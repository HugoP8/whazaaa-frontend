<template>
  <v-card elevation="2" rounded="xl" class="credits-widget">
    <v-card-title class="pa-4 bg-gradient-credits">
      <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
      <span>Mis Créditos</span>
      <v-spacer></v-spacer>
      <v-btn
        icon
        size="small"
        variant="text"
        @click="loadBalance"
        :loading="loading"
      >
        <v-icon size="small">mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <template v-if="loading && totalCredits === 0">
        <v-skeleton-loader type="heading" class="mb-2"></v-skeleton-loader>
        <v-skeleton-loader type="text" class="mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="text"></v-skeleton-loader>
      </template>

      <template v-else>
        <!-- Plan Name -->
        <div class="text-center mb-3">
          <v-chip
            :color="getPlanColor(planName)"
            size="large"
            class="font-weight-bold"
          >
            <v-icon start>mdi-crown</v-icon>
            {{ planDisplayName }}
          </v-chip>
        </div>

        <!-- Total Credits -->
        <div class="text-center mb-4">
          <div class="credits-amount" :class="{ 'low-credits': isLowCredits }">
            {{ totalCredits }}
          </div>
          <div class="text-caption text-grey">Créditos Totales</div>
        </div>

        <!-- Credits Breakdown -->
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

        <!-- Renewal Info for Pro/Business -->
        <v-alert
          v-if="planExpiresAt && planName !== 'free'"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="text-caption">
            <v-icon size="16" start>mdi-calendar-clock</v-icon>
            Renovación: {{ formatDate(planExpiresAt) }}
          </div>
        </v-alert>

        <!-- Trial Info for Free -->
        <v-alert
          v-if="planName === 'free' && trialExpiresAt"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="text-caption">
            <v-icon size="16" start>mdi-clock-alert</v-icon>
            Trial: {{ daysRemaining(trialExpiresAt) }} días restantes
          </div>
        </v-alert>

        <!-- Low Credits Warning -->
        <v-alert
          v-if="isLowCredits && totalCredits > 0"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="text-caption">
            <v-icon size="16" start>mdi-alert</v-icon>
            Créditos bajos. ¡Recarga pronto!
          </div>
        </v-alert>

        <!-- No Credits Warning -->
        <v-alert
          v-if="totalCredits === 0"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="text-caption">
            <v-icon size="16" start>mdi-alert-circle</v-icon>
            Sin créditos. No puedes enviar campañas.
          </div>
        </v-alert>

        <!-- Action Buttons -->
        <div class="d-flex flex-column gap-2">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            block
            @click="openRechargeModal"
            prepend-icon="mdi-plus-circle"
          >
            Recargar Créditos
          </v-btn>

          <v-btn
            color="success"
            variant="tonal"
            size="small"
            block
            @click="openVideoRewardModal"
            prepend-icon="mdi-play-circle"
          >
            <span class="d-flex align-center">
              Ganar Créditos Gratis
              <v-chip size="x-small" color="success" class="ml-2">+1</v-chip>
            </span>
          </v-btn>

          <v-btn
            color="grey"
            variant="outlined"
            size="small"
            block
            @click="$router.push('/subscription')"
            prepend-icon="mdi-information"
          >
            Ver Mi Plan
          </v-btn>
        </div>

        <!-- Usage Info -->
        <div class="text-caption text-grey text-center mt-3">
          1 campaña = 1 crédito
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const store = useStore()
const router = useRouter()

// Emits
const emit = defineEmits(['open-recharge-modal', 'open-video-reward-modal'])

// Estado
const loading = ref(false)

// Computed
const totalCredits = computed(() => store.getters['credits/totalCredits'])
const planCredits = computed(() => store.getters['credits/planCredits'])
const bonusCredits = computed(() => store.getters['credits/bonusCredits'])
const planName = computed(() => store.getters['credits/currentPlan'])
const planDisplayName = computed(() => store.getters['credits/currentPlanDisplay'])
const planExpiresAt = computed(() => store.getters['credits/planExpiresAt'])
const trialExpiresAt = computed(() => store.getters['credits/trialExpiresAt'])
const isLowCredits = computed(() => store.getters['credits/isLowCredits'])

// Métodos
const getPlanColor = (planName) => {
  const colors = {
    free: 'grey',
    pro: 'primary',
    business: 'purple',
    flex: 'orange'
  }
  return colors[planName] || 'grey'
}

const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY')
}

const daysRemaining = (date) => {
  if (!date) return 0
  const diff = dayjs(date).diff(dayjs(), 'day')
  return Math.max(0, diff)
}

const loadBalance = async () => {
  try {
    loading.value = true
    await store.dispatch('credits/fetchBalance')
  } catch (error) {
    console.error('Error loading balance:', error)
  } finally {
    loading.value = false
  }
}

const openRechargeModal = () => {
  emit('open-recharge-modal')
}

const openVideoRewardModal = () => {
  emit('open-video-reward-modal')
}

// Lifecycle
onMounted(() => {
  loadBalance()
})
</script>

<style scoped>
.credits-widget {
  height: 100%;
  transition: all 0.3s ease;
}

.credits-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 111, 0, 0.15) !important;
}

.bg-gradient-credits {
  background: linear-gradient(135deg, #ff6f00 0%, #f57c00 100%);
  color: white;
}

.credits-amount {
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 1;
  color: #ff6f00;
  transition: color 0.3s ease;
}

.credits-amount.low-credits {
  color: #f57c00;
  animation: pulse-warning 2s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .credits-widget:hover {
    transform: none;
  }

  .credits-amount {
    font-size: 2.5rem;
  }
}
</style>
