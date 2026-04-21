<template>
  <v-dialog
    v-model="showDialog"
    max-width="700"
    persistent
    scrollable
  >
    <v-card rounded="xl">
      <v-card-title class="pa-6 bg-gradient-recharge">
        <v-icon class="mr-2">mdi-wallet-plus</v-icon>
        Recargar Créditos
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Current Balance -->
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption">Balance Actual</div>
              <div class="text-h6 font-weight-bold">
                {{ currentBalance }} créditos
              </div>
            </div>
            <div>
              <div class="text-caption">Plan Actual</div>
              <v-chip :color="getPlanColor(currentPlan)" size="small">
                {{ currentPlanDisplay }}
              </v-chip>
            </div>
          </div>
        </v-alert>

        <!-- Loading State -->
        <template v-if="loading">
          <v-skeleton-loader type="card" class="mb-4"></v-skeleton-loader>
          <v-skeleton-loader type="card"></v-skeleton-loader>
        </template>

        <!-- Recharge Options -->
        <template v-else>
          <div class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon class="mr-2">mdi-package-variant</v-icon>
              Selecciona un Paquete
            </h3>

            <v-row dense>
              <v-col
                v-for="option in rechargeOptions"
                :key="option.credits"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="recharge-option"
                  :class="{ 'selected-option': selectedOption?.credits === option.credits }"
                  @click="selectedOption = option"
                  variant="outlined"
                  :color="selectedOption?.credits === option.credits ? 'primary' : ''"
                  hover
                >
                  <v-card-text class="pa-3 text-center">
                    <!-- Discount Badge -->
                    <v-chip
                      v-if="option.discount_percent > 0"
                      size="x-small"
                      color="success"
                      class="mb-2"
                    >
                      {{ option.discount_percent }}% OFF
                    </v-chip>
                    <div v-else style="height: 24px"></div>

                    <!-- Credits -->
                    <div class="text-h5 font-weight-bold text-primary">
                      {{ option.total_credits }}
                    </div>
                    <div class="text-caption text-grey mb-2">
                      {{ option.credits }} + {{ option.bonus_credits }} bonus
                    </div>

                    <!-- Price -->
                    <div class="text-h6 font-weight-bold">
                      {{ option.final_price }} BS
                    </div>
                    <div class="text-caption text-grey">
                      {{ (option.final_price / option.total_credits).toFixed(2) }} BS/crédito
                    </div>

                    <!-- Original Price -->
                    <div
                      v-if="option.original_price > option.final_price"
                      class="text-caption text-grey text-decoration-line-through mt-1"
                    >
                      {{ option.original_price }} BS
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Seller Selection -->
          <div v-if="selectedOption" class="mb-4">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon class="mr-2">mdi-account-tie</v-icon>
              Selecciona tu Vendedor
            </h3>

            <v-select
              v-model="selectedSeller"
              :items="sellers"
              item-title="name"
              item-value="id"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              :rules="[v => !!v || 'Selecciona un vendedor']"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <template v-slot:subtitle>
                    <v-icon size="14">mdi-whatsapp</v-icon>
                    {{ item.raw.whatsapp_number }}
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>

          <!-- Payment Instructions -->
          <v-alert
            v-if="selectedOption && selectedSeller"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-subtitle-2 font-weight-bold mb-2">
              <v-icon start>mdi-information</v-icon>
              Instrucciones de Pago
            </div>
            <ol class="text-caption ml-4">
              <li>Contacta a <strong>{{ getSellerName() }}</strong> al WhatsApp: <strong>{{ getSellerWhatsApp() }}</strong></li>
              <li>Menciona tu ID de usuario: <strong>{{ userId }}</strong></li>
              <li>Indica el paquete: <strong>{{ selectedOption.total_credits }} créditos por {{ selectedOption.final_price }} BS</strong></li>
              <li>Realiza el pago según las instrucciones del vendedor</li>
              <li>El vendedor aprobará tu recarga automáticamente</li>
            </ol>
          </v-alert>

          <!-- Notes (optional) -->
          <v-textarea
            v-if="selectedOption && selectedSeller"
            v-model="notes"
            label="Notas adicionales (opcional)"
            variant="outlined"
            rows="2"
            prepend-inner-icon="mdi-note-text"
            hint="Ej: Transferencia bancaria, código de referencia, etc."
            persistent-hint
          ></v-textarea>
        </template>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
          :disabled="submitting"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="submitting"
          :disabled="!selectedOption || !selectedSeller"
          @click="submitRequest"
        >
          Solicitar Recarga
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const store = useStore()
const toast = useToast()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// Estado
const loading = ref(false)
const submitting = ref(false)
const rechargeOptions = ref([])
const sellers = ref([])
const selectedOption = ref(null)
const selectedSeller = ref(null)
const notes = ref('')

// Computed
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentBalance = computed(() => store.getters['credits/totalCredits'])
const currentPlan = computed(() => store.getters['credits/currentPlan'])
const currentPlanDisplay = computed(() => store.getters['credits/currentPlanDisplay'])
const userId = computed(() => store.getters['auth/user']?.id || '-')

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

const getSellerName = () => {
  const seller = sellers.value.find(s => s.id === selectedSeller.value)
  return seller?.name || ''
}

const getSellerWhatsApp = () => {
  const seller = sellers.value.find(s => s.id === selectedSeller.value)
  return seller?.whatsapp_number || ''
}

const loadData = async () => {
  try {
    loading.value = true

    // Cargar opciones de recarga
    const optionsResponse = await api.get('/credits/recharge-options')
    if (optionsResponse.data.success) {
      rechargeOptions.value = optionsResponse.data.options
    }

    // Cargar vendedores
    const sellersResponse = await api.get('/sellers')
    if (sellersResponse.data.success) {
      sellers.value = sellersResponse.data.sellers
      // Seleccionar el primer vendedor por defecto
      if (sellers.value.length > 0) {
        selectedSeller.value = sellers.value[0].id
      }
    }
  } catch (error) {
    console.error('Error loading recharge data:', error)
    toast.error('Error al cargar opciones de recarga')
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  if (!selectedOption.value || !selectedSeller.value) {
    toast.warning('Selecciona un paquete y un vendedor')
    return
  }

  try {
    submitting.value = true

    const requestData = {
      credits: selectedOption.value.credits,
      bonus: selectedOption.value.bonus_credits,
      price: selectedOption.value.final_price,
      seller_id: selectedSeller.value,
      payment_method: 'manual',
      notes: notes.value || ''
    }

    const response = await api.post('/credits/request-recharge', requestData)

    if (response.data.success) {
      toast.success(response.data.message || 'Solicitud de recarga enviada correctamente')
      emit('success')
      closeDialog()
    }
  } catch (error) {
    console.error('Error requesting recharge:', error)
    const errorMessage = error.response?.data?.error || 'Error al solicitar recarga'
    toast.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

const closeDialog = () => {
  showDialog.value = false
  // Reset form
  setTimeout(() => {
    selectedOption.value = null
    notes.value = ''
  }, 300)
}

// Watch dialog open to load data
watch(showDialog, (newValue) => {
  if (newValue) {
    loadData()
  }
})
</script>

<style scoped>
.bg-gradient-recharge {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  color: white;
}

.recharge-option {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.recharge-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selected-option {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
