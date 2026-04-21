<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-6 bg-gradient-primary">
        <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
        Recargar Créditos
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Info importante -->
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="text-body-2">
            <v-icon class="mr-2">mdi-information</v-icon>
            <strong>Pagos Manuales:</strong> Contacta a tu vendedor de confianza para procesar la recarga.
            No se procesan pagos automáticos en la plataforma.
          </div>
        </v-alert>

        <!-- Balance actual -->
        <v-card variant="tonal" color="primary" class="mb-4">
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-caption">Créditos Actuales</div>
                <div class="text-h5 font-weight-bold">{{ currentBalance }}</div>
              </div>
              <v-icon size="48" color="primary">mdi-wallet</v-icon>
            </div>
          </v-card-text>
        </v-card>

        <!-- Opciones de recarga -->
        <div class="text-h6 font-weight-bold mb-3">Paquetes de Recarga</div>

        <v-row>
          <v-col
            v-for="option in rechargeOptions"
            :key="option.credits"
            cols="12"
            md="6"
          >
            <v-card
              :variant="selectedOption?.credits === option.credits ? 'elevated' : 'outlined'"
              :color="selectedOption?.credits === option.credits ? 'primary' : ''"
              class="recharge-option-card"
              @click="selectOption(option)"
            >
              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div>
                    <v-icon size="32" :color="selectedOption?.credits === option.credits ? 'white' : 'primary'">
                      mdi-wallet-plus
                    </v-icon>
                  </div>
                  <v-chip
                    v-if="option.discount"
                    color="success"
                    size="small"
                  >
                    {{ option.discount }}% OFF
                  </v-chip>
                </div>

                <div :class="selectedOption?.credits === option.credits ? 'text-white' : ''">
                  <div class="text-h4 font-weight-bold">{{ option.credits }}</div>
                  <div class="text-caption mb-2">créditos</div>

                  <v-divider class="my-2" :color="selectedOption?.credits === option.credits ? 'white' : ''"></v-divider>

                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-caption">Precio</div>
                      <div class="text-h6 font-weight-bold">{{ option.price }} BS</div>
                    </div>
                    <div class="text-right">
                      <div class="text-caption">Por crédito</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ (option.price / option.credits).toFixed(2) }} BS
                      </div>
                    </div>
                  </div>

                  <div v-if="option.bonus > 0" class="mt-2">
                    <v-chip size="small" color="success" variant="tonal">
                      <v-icon size="16" class="mr-1">mdi-gift</v-icon>
                      +{{ option.bonus }} bonus
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Selector de vendedor -->
        <div v-if="selectedOption" class="mt-4">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            <v-icon class="mr-2">mdi-account-tie</v-icon>
            Selecciona tu Vendedor
          </div>

          <v-select
            v-model="selectedSeller"
            :items="sellers"
            item-title="name"
            item-value="id"
            label="Vendedor"
            variant="outlined"
            prepend-inner-icon="mdi-account-tie"
            :loading="loadingSellers"
            :disabled="loadingSellers"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-avatar color="primary" size="40">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="item.raw.description">
                  {{ item.raw.description }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </div>

        <!-- Resumen de selección -->
        <v-card v-if="selectedOption && selectedSeller" variant="tonal" color="success" class="mt-4">
          <v-card-text class="pa-4">
            <div class="text-subtitle-1 font-weight-bold mb-2">Resumen de Recarga</div>
            <v-row dense>
              <v-col cols="6">
                <div class="text-caption">Créditos a recibir:</div>
                <div class="text-h6 font-weight-bold">
                  {{ selectedOption.credits }}
                  <span v-if="selectedOption.bonus > 0" class="text-success">
                    +{{ selectedOption.bonus }}
                  </span>
                </div>
              </v-col>
              <v-col cols="6" class="text-right">
                <div class="text-caption">Total a pagar:</div>
                <div class="text-h6 font-weight-bold">{{ selectedOption.price }} BS</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Información de contacto del vendedor seleccionado -->
        <v-card v-if="selectedSeller" variant="outlined" class="mt-4">
          <v-card-text class="pa-4">
            <div class="text-subtitle-1 font-weight-bold mb-3">
              <v-icon class="mr-2">mdi-account-tie</v-icon>
              Información del Vendedor
            </div>

            <v-list density="compact" class="bg-transparent">
              <v-list-item
                prepend-icon="mdi-whatsapp"
                :href="`https://wa.me/${currentSellerInfo.whatsapp_number}`"
                target="_blank"
              >
                <v-list-item-title>WhatsApp: {{ currentSellerInfo.whatsapp_number }}</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="currentSellerInfo.email"
                prepend-icon="mdi-email"
                :href="`mailto:${currentSellerInfo.email}`"
              >
                <v-list-item-title>Email: {{ currentSellerInfo.email }}</v-list-item-title>
              </v-list-item>

              <v-list-item
                v-if="currentSellerInfo.phone"
                prepend-icon="mdi-phone"
                :href="`tel:${currentSellerInfo.phone}`"
              >
                <v-list-item-title>Teléfono: {{ currentSellerInfo.phone }}</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-alert type="success" variant="tonal" density="compact" class="mt-3">
              <div class="text-caption">
                Menciona tu <strong>ID de usuario</strong> al vendedor: <strong>#{{ userId }}</strong>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Instrucciones -->
        <v-expansion-panels class="mt-4" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-help-circle</v-icon>
              ¿Cómo funciona?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ol class="text-body-2 pl-4">
                <li class="mb-2">
                  Selecciona el paquete de créditos que deseas
                </li>
                <li class="mb-2">
                  Contacta al vendedor por tu canal preferido (WhatsApp, email o teléfono)
                </li>
                <li class="mb-2">
                  Menciona tu <strong>ID de usuario (#{{ userId }})</strong> y el paquete seleccionado
                </li>
                <li class="mb-2">
                  Realiza el pago según las instrucciones del vendedor
                </li>
                <li class="mb-2">
                  El vendedor procesará tu recarga manualmente
                </li>
                <li>
                  Recibirás una notificación cuando los créditos estén disponibles (usualmente en 24h)
                </li>
              </ol>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('update:modelValue', false)"
          :disabled="loading"
        >
          Cerrar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          variant="elevated"
          :disabled="!selectedOption || !selectedSeller"
          :loading="loading"
          prepend-icon="mdi-whatsapp"
          :href="selectedSeller ? `https://wa.me/${currentSellerInfo.whatsapp_number}?text=${getWhatsAppMessage()}` : '#'"
          target="_blank"
          @click="handleContactVendor"
        >
          Contactar por WhatsApp
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { sellersService } from '@/services/sellersService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'request-recharge'])

const store = useStore()

// Estado
const selectedOption = ref(null)
const selectedSeller = ref(null)
const sellers = ref([])
const loadingSellers = ref(false)

// Computed
const userId = computed(() => store.getters['auth/user']?.id || 0)

// Computed para información del vendedor actual
const currentSellerInfo = computed(() => {
  if (!selectedSeller.value) return {}
  return sellers.value.find(s => s.id === selectedSeller.value) || {}
})

// Opciones de recarga basadas en el plan del usuario
const rechargeOptions = computed(() => {
  const currentPlan = store.getters['credits/currentPlan']

  // Opciones base para todos
  const baseOptions = [
    { credits: 10, price: 100, bonus: 0, discount: 0 },
    { credits: 25, price: 225, bonus: 5, discount: 10 },
    { credits: 50, price: 400, bonus: 10, discount: 20 },
    { credits: 100, price: 700, bonus: 25, discount: 30 }
  ]

  // Aplicar descuentos según el plan
  const planDiscounts = {
    free: 0,
    pro: 20,
    business: 30,
    flex: 0
  }

  const discount = planDiscounts[currentPlan] || 0

  return baseOptions.map(option => {
    const discountedPrice = option.price * (1 - discount / 100)
    return {
      ...option,
      price: Math.round(discountedPrice),
      discount: discount || option.discount
    }
  })
})

// Methods
const loadSellers = async () => {
  try {
    loadingSellers.value = true
    const response = await sellersService.getSellers()
    if (response.success) {
      sellers.value = response.sellers || []
      // Seleccionar el primer vendedor activo por defecto
      if (sellers.value.length > 0) {
        selectedSeller.value = sellers.value[0].id
      }
    }
  } catch (error) {
    console.error('Error loading sellers:', error)
  } finally {
    loadingSellers.value = false
  }
}

const selectOption = (option) => {
  selectedOption.value = option
}

const getWhatsAppMessage = () => {
  if (!selectedOption.value) return ''

  const message = `Hola! Soy el usuario #${userId.value} de Whazaaa.

Quiero recargar:
- ${selectedOption.value.credits} créditos ${selectedOption.value.bonus > 0 ? `+ ${selectedOption.value.bonus} bonus` : ''}
- Total a pagar: ${selectedOption.value.price} BS

¿Cómo puedo proceder con el pago?`

  return encodeURIComponent(message)
}

const handleContactVendor = () => {
  if (!selectedSeller.value) return

  // Registrar solicitud de recarga con seller_id
  emit('request-recharge', {
    credits: selectedOption.value.credits,
    bonus: selectedOption.value.bonus,
    price: selectedOption.value.price,
    seller_id: selectedSeller.value
  })
}

// Watch para cargar vendedores cuando se abre el modal
watch(() => props.modelValue, (newValue) => {
  if (newValue && sellers.value.length === 0) {
    loadSellers()
  }
})

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    loadSellers()
  }
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.recharge-option-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.recharge-option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
</style>
