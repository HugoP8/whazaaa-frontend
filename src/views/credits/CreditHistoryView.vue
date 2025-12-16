<template>
  <div class="credit-history-view">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          <v-icon class="mr-2">mdi-history</v-icon>
          Historial de Créditos
        </h1>
      </v-col>
    </v-row>

    <!-- Balance actual -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="xl" color="primary" dark>
          <v-card-text class="pa-6 text-center">
            <v-icon size="48" class="mb-3">mdi-wallet</v-icon>
            <div class="text-h3 font-weight-bold mb-2">{{ totalCredits }}</div>
            <div class="text-body-1">Créditos Disponibles</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="xl" variant="tonal" color="primary">
          <v-card-text class="pa-6 text-center">
            <v-icon size="40" color="primary" class="mb-3">mdi-package-variant</v-icon>
            <div class="text-h4 font-weight-bold text-primary mb-2">{{ planCredits }}</div>
            <div class="text-body-2 text-grey">Créditos del Plan</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="xl" variant="tonal" color="success">
          <v-card-text class="pa-6 text-center">
            <v-icon size="40" color="success" class="mb-3">mdi-gift</v-icon>
            <div class="text-h4 font-weight-bold text-success mb-2">{{ bonusCredits }}</div>
            <div class="text-body-2 text-grey">Créditos Bonus</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Acciones rápidas -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" variant="tonal" color="info">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between flex-wrap gap-3">
              <div class="d-flex align-center">
                <v-icon color="info" size="28" class="mr-3">mdi-information</v-icon>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Plan Actual: {{ currentPlanDisplay }}</div>
                  <div class="text-body-2 text-grey">
                    1 crédito = 1 mensaje enviado
                  </div>
                </div>
              </div>

              <div class="d-flex gap-2">
                <v-btn
                  color="info"
                  variant="elevated"
                  prepend-icon="mdi-lightning-bolt"
                  @click="showRechargeModal = true"
                >
                  Recargar Créditos
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-crown"
                  @click="$router.push('/pricing')"
                >
                  Ver Planes
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Historial -->
    <v-row>
      <v-col cols="12">
        <CreditHistory />
      </v-col>
    </v-row>

    <!-- Modal de recarga -->
    <RechargeCreditsModal
      v-model="showRechargeModal"
      :current-balance="totalCredits"
      :loading="rechargeLoading"
      @request-recharge="handleRechargeRequest"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import CreditHistory from '@/components/credits/CreditHistory.vue'
import RechargeCreditsModal from '@/components/credits/RechargeCreditsModal.vue'

const store = useStore()
const toast = useToast()

// Estado
const showRechargeModal = ref(false)
const rechargeLoading = ref(false)

// Computed
const totalCredits = computed(() => store.getters['credits/totalCredits'] || 0)
const planCredits = computed(() => store.getters['credits/planCredits'] || 0)
const bonusCredits = computed(() => store.getters['credits/bonusCredits'] || 0)
const currentPlanDisplay = computed(() => store.getters['credits/currentPlanDisplay'] || 'Gratuito')

// Methods
const handleRechargeRequest = async (rechargeData) => {
  try {
    rechargeLoading.value = true
    console.log('[CreditHistoryView] Solicitud de recarga:', rechargeData)

    await store.dispatch('credits/requestRecharge', rechargeData)

    toast.success('Solicitud de recarga registrada. Contacta a tu vendedor para completar el pago.')
    showRechargeModal.value = false
  } catch (error) {
    console.error('[CreditHistoryView] Error en solicitud de recarga:', error)
    toast.error('Error al registrar solicitud de recarga')
  } finally {
    rechargeLoading.value = false
  }
}
</script>

<style scoped>
.credit-history-view {
  padding: 24px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>
