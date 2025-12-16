<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-6 bg-gradient-admin">
        <v-icon class="mr-2">mdi-wallet-plus</v-icon>
        Recargar Créditos - {{ user?.email || 'Usuario' }}
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Información del usuario -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-grey">Usuario</div>
                <div class="text-body-1 font-weight-medium">{{ user?.name || user?.email }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Plan Actual</div>
                <div class="text-body-1 font-weight-medium">
                  <v-chip size="small" :color="getPlanColor(user?.plan_name)">
                    {{ user?.plan_display_name || 'Free' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Créditos Actuales</div>
                <div class="text-h6 font-weight-bold text-primary">{{ user?.total_credits || 0 }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey">Desglose</div>
                <div class="text-body-2">
                  Plan: <strong>{{ user?.plan_credits || 0 }}</strong> |
                  Bonus: <strong>{{ user?.bonus_credits || 0 }}</strong>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Formulario de recarga -->
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <!-- Tipo de recarga -->
          <v-select
            v-model="rechargeType"
            label="Tipo de Recarga"
            :items="rechargeTypes"
            item-title="label"
            item-value="value"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            class="mb-4"
            :disabled="loading"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>

          <!-- Cantidad de créditos -->
          <v-text-field
            v-model.number="credits"
            label="Cantidad de Créditos"
            type="number"
            prepend-inner-icon="mdi-lightning-bolt"
            variant="outlined"
            :rules="[rules.required, rules.positive]"
            :disabled="loading"
            class="mb-4"
            hint="Créditos a agregar (mínimo 1)"
            persistent-hint
          ></v-text-field>

          <!-- Monto pagado (opcional) -->
          <v-text-field
            v-model.number="amount"
            label="Monto Pagado (BS)"
            type="number"
            prepend-inner-icon="mdi-cash"
            variant="outlined"
            :disabled="loading"
            class="mb-4"
            hint="Monto en bolivianos (opcional)"
            persistent-hint
          ></v-text-field>

          <!-- Método de pago -->
          <v-select
            v-model="paymentMethod"
            label="Método de Pago"
            :items="paymentMethods"
            prepend-inner-icon="mdi-credit-card"
            variant="outlined"
            :disabled="loading"
            class="mb-4"
          ></v-select>

          <!-- Notas -->
          <v-textarea
            v-model="notes"
            label="Notas / Observaciones"
            prepend-inner-icon="mdi-note-text"
            variant="outlined"
            rows="3"
            :disabled="loading"
            class="mb-4"
            hint="Información adicional sobre la recarga"
            persistent-hint
          ></v-textarea>

          <!-- Resumen -->
          <v-card variant="tonal" color="success" class="mb-4">
            <v-card-text class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3">Resumen de Recarga</div>
              <v-row dense>
                <v-col cols="6">
                  <div class="text-caption">Créditos a agregar:</div>
                  <div class="text-h6 font-weight-bold">+{{ credits }}</div>
                  <div class="text-caption" :class="getTypeColorClass()">
                    {{ getTypeLabel() }}
                  </div>
                </v-col>
                <v-col cols="6" class="text-right">
                  <div class="text-caption">Nuevo total:</div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{ (user?.total_credits || 0) + (credits || 0) }}
                  </div>
                  <div class="text-caption text-grey">créditos</div>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <div class="text-caption">
                <v-icon size="16" class="mr-1">mdi-information</v-icon>
                Esta acción quedará registrada en el historial del usuario
              </div>
            </v-card-text>
          </v-card>

          <!-- Alerta de advertencia -->
          <v-alert type="warning" variant="tonal" density="compact" class="mb-0">
            <div class="text-body-2">
              <v-icon size="18" class="mr-1">mdi-alert</v-icon>
              Verifica los datos antes de confirmar. Esta acción no se puede deshacer automáticamente.
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          color="grey"
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          variant="elevated"
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
          prepend-icon="mdi-check"
        >
          Confirmar Recarga
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'recharge'])

// Estado
const formRef = ref(null)
const rechargeType = ref('bonus')
const credits = ref(10)
const amount = ref(null)
const paymentMethod = ref('Efectivo')
const notes = ref('')

// Tipos de recarga
const rechargeTypes = [
  {
    value: 'bonus',
    label: 'Créditos Bonus',
    description: 'Los créditos no expiran',
    icon: 'mdi-gift',
    color: 'success'
  },
  {
    value: 'plan',
    label: 'Créditos de Plan',
    description: 'Se renuevan según el plan',
    icon: 'mdi-package-variant',
    color: 'primary'
  }
]

// Métodos de pago
const paymentMethods = [
  'Efectivo',
  'Transferencia Bancaria',
  'QR',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'Otro'
]

// Validaciones
const rules = {
  required: v => !!v || 'Campo requerido',
  positive: v => v > 0 || 'Debe ser mayor a 0'
}

// Computed
const canSubmit = computed(() => {
  return credits.value > 0 && !props.loading
})

const getPlanColor = (planName) => {
  const colors = {
    free: 'grey',
    pro: 'primary',
    business: 'purple',
    flex: 'orange'
  }
  return colors[planName] || 'grey'
}

const getTypeLabel = () => {
  const type = rechargeTypes.find(t => t.value === rechargeType.value)
  return type?.label || ''
}

const getTypeColorClass = () => {
  const type = rechargeTypes.find(t => t.value === rechargeType.value)
  return `text-${type?.color || 'grey'}`
}

// Methods
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) {
    return
  }

  const rechargeData = {
    user_id: props.user?.id,
    credits: credits.value,
    type: rechargeType.value,
    amount: amount.value,
    payment_method: paymentMethod.value,
    notes: notes.value
  }

  emit('recharge', rechargeData)
}

const handleCancel = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  rechargeType.value = 'bonus'
  credits.value = 10
  amount.value = null
  paymentMethod.value = 'Efectivo'
  notes.value = ''
  formRef.value?.resetValidation()
}

// Watch para resetear el formulario cuando se cierra
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    setTimeout(resetForm, 300) // Delay para que la animación de cierre se vea bien
  }
})
</script>

<style scoped>
.bg-gradient-admin {
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
  color: white;
}
</style>
