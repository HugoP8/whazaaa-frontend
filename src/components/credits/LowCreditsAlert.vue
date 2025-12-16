<template>
  <v-snackbar
    v-model="show"
    :timeout="-1"
    location="top"
    color="warning"
    elevation="8"
    rounded="xl"
    class="low-credits-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon size="28" class="mr-3 pulse-icon">mdi-alert</v-icon>
      <div class="flex-grow-1">
        <div class="text-subtitle-1 font-weight-bold mb-1">
          Créditos Bajos
        </div>
        <div class="text-body-2">
          Te quedan solo <strong>{{ totalCredits }}</strong> crédito{{ totalCredits !== 1 ? 's' : '' }}.
          {{ planName === 'flex' ? 'Contacta a tu vendedor para recargar.' : 'Recarga ahora o espera la renovación mensual.' }}
        </div>
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        size="small"
        @click="handleDismiss"
      >
        Cerrar
      </v-btn>
      <v-btn
        color="white"
        variant="elevated"
        size="small"
        prepend-icon="mdi-lightning-bolt"
        @click="handleRecharge"
      >
        Recargar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const emit = defineEmits(['recharge'])

// Estado
const show = ref(false)
const dismissed = ref(false)

// Computed
const totalCredits = computed(() => store.getters['credits/totalCredits'] || 0)
const isLowCredits = computed(() => store.getters['credits/isLowCredits'])
const planName = computed(() => store.getters['credits/currentPlan'] || 'free')

// Watch para mostrar alerta cuando créditos sean bajos
watch([isLowCredits, totalCredits], ([low, credits]) => {
  if (low && credits > 0 && !dismissed.value) {
    show.value = true
  } else if (!low) {
    show.value = false
    dismissed.value = false
  }
}, { immediate: true })

// Methods
const handleDismiss = () => {
  show.value = false
  dismissed.value = true
}

const handleRecharge = () => {
  show.value = false
  emit('recharge')
}
</script>

<style scoped>
.low-credits-snackbar {
  margin-top: 80px !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.pulse-icon {
  animation: pulse 2s infinite;
}
</style>
