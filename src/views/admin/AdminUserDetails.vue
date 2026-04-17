<template>
  <div class="admin-user-details">
    <v-row>
      <v-col cols="12">
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          @click="$router.push('/admin/users')"
        >
          Volver a Usuarios
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- User Details -->
    <template v-else-if="user">
      <v-row class="mt-4">
        <v-col cols="12" md="4">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 bg-primary">
              <v-icon class="mr-2">mdi-account</v-icon>
              Información del Usuario
            </v-card-title>

            <v-card-text class="pa-6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Email</div>
                <div class="text-body-1">{{ user.user_info?.email }}</div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Nombre</div>
                <div class="text-body-1">{{ user.user_info?.name || '-' }}</div>
              </div>

              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Rol</div>
                <v-chip :color="getRoleColor(user.user_info?.role)" size="small">
                  {{ user.user_info?.role }}
                </v-chip>
              </div>

              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Registrado</div>
                <div class="text-body-2">{{ formatDate(user.user_info?.created_at) }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-row>
            <!-- Balance de créditos -->
            <v-col cols="12" md="6">
              <v-card elevation="2" rounded="xl">
                <v-card-title class="pa-6 bg-gradient-credits d-flex justify-space-between align-center">
                  <div>
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    Balance de Créditos
                  </div>
                  <v-btn
                    size="small"
                    color="white"
                    variant="elevated"
                    prepend-icon="mdi-plus-circle"
                    @click="showRechargeDialog = true"
                  >
                    Recargar
                  </v-btn>
                </v-card-title>

                <v-card-text class="pa-6">
                  <div class="text-center mb-4">
                    <div class="text-h2 font-weight-bold text-orange">
                      {{ user.credits?.total_credits || 0 }}
                    </div>
                    <div class="text-caption text-grey">Créditos Totales</div>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <v-row dense>
                    <v-col cols="6">
                      <v-card variant="tonal" color="primary" rounded="lg">
                        <v-card-text class="pa-3 text-center">
                          <v-icon size="20" class="mb-1">mdi-package-variant</v-icon>
                          <div class="text-caption">Plan</div>
                          <div class="text-h6 font-weight-bold">{{ user.credits?.plan_credits || 0 }}</div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="6">
                      <v-card variant="tonal" color="success" rounded="lg">
                        <v-card-text class="pa-3 text-center">
                          <v-icon size="20" class="mb-1">mdi-gift</v-icon>
                          <div class="text-caption">Bonus</div>
                          <div class="text-h6 font-weight-bold">{{ user.credits?.bonus_credits || 0 }}</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Suscripción -->
            <v-col cols="12" md="6">
              <v-card elevation="2" rounded="xl">
                <v-card-title class="pa-6 bg-success d-flex justify-space-between align-center">
                  <div>
                    <v-icon class="mr-2">mdi-crown</v-icon>
                    Suscripción Actual
                  </div>
                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      color="white"
                      variant="elevated"
                      prepend-icon="mdi-swap-horizontal"
                      @click="showChangePlanDialog = true"
                    >
                      Cambiar Plan
                    </v-btn>
                    <v-btn
                      v-if="user.subscription?.plan_name && user.subscription?.plan_name !== 'free'"
                      size="small"
                      color="white"
                      variant="elevated"
                      prepend-icon="mdi-calendar-plus"
                      @click="showExtendDialog = true"
                    >
                      Extender
                    </v-btn>
                  </div>
                </v-card-title>

                <v-card-text class="pa-6">
                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Plan</div>
                    <v-chip :color="getPlanColor(user.subscription?.plan_name)" size="large">
                      {{ user.subscription?.plan_display_name || 'Sin plan' }}
                    </v-chip>
                  </div>

                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Estado</div>
                    <v-chip :color="getStatusColor(user.subscription?.status)" size="small">
                      {{ user.subscription?.status || 'Sin suscripción' }}
                    </v-chip>
                  </div>

                  <div class="mb-3">
                    <div class="text-caption text-grey mb-1">Inicio</div>
                    <div class="text-body-2">{{ formatDate(user.subscription?.started_at) }}</div>
                  </div>

                  <div>
                    <div class="text-caption text-grey mb-1">Vencimiento</div>
                    <div class="text-body-2">{{ formatDate(user.subscription?.expires_at) }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Statistics -->
      <v-row class="mt-4">
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="primary" size="40" class="mb-2">mdi-email-multiple</v-icon>
              <div class="text-h5 font-weight-bold">{{ user.statistics?.total_campaigns || 0 }}</div>
              <div class="text-caption text-grey">Campañas</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="success" size="40" class="mb-2">mdi-send</v-icon>
              <div class="text-h5 font-weight-bold">{{ user.statistics?.total_messages_sent || 0 }}</div>
              <div class="text-caption text-grey">Mensajes Enviados</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="error" size="40" class="mb-2">mdi-close-circle</v-icon>
              <div class="text-h5 font-weight-bold">{{ user.statistics?.total_messages_failed || 0 }}</div>
              <div class="text-caption text-grey">Mensajes Fallidos</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="orange" size="40" class="mb-2">mdi-currency-usd</v-icon>
              <div class="text-h5 font-weight-bold">${{ parseFloat(user.statistics?.total_spent || 0).toFixed(2) }}</div>
              <div class="text-caption text-grey">Total Gastado</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Modal de recarga de créditos -->
    <AdminCreditRecharge
      v-model="showRechargeDialog"
      :user="userForRecharge"
      :loading="rechargeLoading"
      @recharge="handleCreditRecharge"
    />

    <!-- Modal de cambiar plan -->
    <v-dialog v-model="showChangePlanDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-gradient-plan">
          <v-icon class="mr-2">mdi-swap-horizontal</v-icon>
          Cambiar Plan
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              Usuario: <strong>{{ user.user_info?.email }}</strong><br>
              Plan actual: <strong>{{ user.subscription?.plan_display_name }}</strong>
            </div>
          </v-alert>

          <v-form ref="changePlanFormRef">
            <v-select
              v-model="changePlanData.plan_name"
              label="Nuevo Plan"
              :items="planOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              prepend-inner-icon="mdi-crown"
              :rules="[v => !!v || 'Campo requerido']"
              class="mb-4"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar :color="item.raw.color" size="40">
                      <v-icon color="white">mdi-crown</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <v-textarea
              v-model="changePlanData.notes"
              label="Notas (opcional)"
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="2"
              hint="Ej: Cliente solicitó upgrade, pago verificado"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="handleCancelChangePlan"
            :disabled="changePlanLoading"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="changePlanLoading"
            @click="handleChangePlan"
          >
            Cambiar Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de extender suscripción -->
    <v-dialog v-model="showExtendDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-gradient-extend">
          <v-icon class="mr-2">mdi-calendar-plus</v-icon>
          Extender Suscripción
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              Usuario: <strong>{{ user.user_info?.email }}</strong><br>
              Plan actual: <strong>{{ user.subscription?.plan_display_name }}</strong><br>
              Vence: <strong>{{ formatDate(user.subscription?.expires_at) }}</strong>
            </div>
          </v-alert>

          <v-form ref="extendFormRef">
            <v-select
              v-model="extendData.months"
              label="Meses a extender"
              :items="monthsOptions"
              variant="outlined"
              prepend-inner-icon="mdi-calendar"
              :rules="[v => !!v || 'Campo requerido']"
              class="mb-4"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:append>
                    <v-chip size="small" color="primary">
                      {{ item.raw.label }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-textarea
              v-model="extendData.reason"
              label="Motivo de extensión"
              variant="outlined"
              prepend-inner-icon="mdi-text"
              rows="3"
              :rules="[v => !!v || 'Campo requerido']"
              hint="Ejemplo: Compensación por problemas técnicos, promoción especial, etc."
              persistent-hint
            ></v-textarea>
          </v-form>

          <v-card variant="tonal" color="success" class="mt-4">
            <v-card-text class="pa-4">
              <div class="text-subtitle-2 mb-2">Nueva fecha de vencimiento:</div>
              <div class="text-h6 font-weight-bold">{{ calculateNewExpiryDate() }}</div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="handleCancelExtend"
            :disabled="extendLoading"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="elevated"
            :loading="extendLoading"
            @click="handleExtendSubscription"
          >
            Confirmar Extensión
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import AdminCreditRecharge from '@/components/admin/AdminCreditRecharge.vue'

const store = useStore()
const route = useRoute()
const toast = useToast()

// Estado
const showRechargeDialog = ref(false)
const rechargeLoading = ref(false)
const showExtendDialog = ref(false)
const extendLoading = ref(false)
const extendFormRef = ref(null)
const showChangePlanDialog = ref(false)
const changePlanLoading = ref(false)
const changePlanFormRef = ref(null)

const extendData = ref({
  months: 1,
  reason: ''
})

const monthsOptions = [
  { value: 1, title: '1 mes', label: '+30 días' },
  { value: 2, title: '2 meses', label: '+60 días' },
  { value: 3, title: '3 meses', label: '+90 días' },
  { value: 6, title: '6 meses', label: '+180 días' },
  { value: 12, title: '12 meses', label: '+365 días' }
]

const changePlanData = ref({
  plan_name: '',
  notes: ''
})

const planOptions = [
  { value: 'free', title: 'Gratuito (Trial)', subtitle: '3 créditos - 10 días', color: 'grey' },
  { value: 'pro', title: 'Profesional', subtitle: '30 créditos/mes - 200 BS', color: 'primary' },
  { value: 'business', title: 'Empresarial', subtitle: '100 créditos/mes - 600 BS', color: 'purple' },
  { value: 'flex', title: 'Flex / Recarga', subtitle: 'Sin cuota mensual', color: 'orange' }
]

const loading = computed(() => store.getters['admin/loading'])
const user = computed(() => store.getters['admin/selectedUser'])

// Computed para datos del usuario en formato para el modal de recarga
const userForRecharge = computed(() => {
  if (!user.value) return null

  return {
    id: user.value.user_info?.id,
    email: user.value.user_info?.email,
    name: user.value.user_info?.name,
    plan_name: user.value.subscription?.plan_name || 'free',
    plan_display_name: user.value.subscription?.plan_display_name || 'Free',
    total_credits: user.value.credits?.total_credits || 0,
    plan_credits: user.value.credits?.plan_credits || 0,
    bonus_credits: user.value.credits?.bonus_credits || 0
  }
})

const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const getRoleColor = (role) => {
  const colors = { user: 'blue', admin: 'amber-darken-2', superadmin: 'pink-darken-2' }
  return colors[role] || 'grey'
}

const getPlanColor = (planName) => {
  const colors = { free: 'grey', pro: 'primary', premium: 'purple', enterprise: 'orange' }
  return colors[planName] || 'grey'
}

const getStatusColor = (status) => {
  const colors = { active: 'success', cancelled: 'error', expired: 'warning' }
  return colors[status] || 'grey'
}

// Método para manejar recarga de créditos
const handleCreditRecharge = async (rechargeData) => {
  try {
    rechargeLoading.value = true
    console.log('[AdminUserDetails] Procesando recarga:', rechargeData)

    const response = await store.dispatch('admin/rechargeUserCredits', {
      userId: rechargeData.user_id,
      credits: rechargeData.credits,
      type: rechargeData.type,
      amount: rechargeData.amount,
      payment_method: rechargeData.payment_method,
      notes: rechargeData.notes
    })

    if (response.success) {
      toast.success(`Recarga exitosa: +${rechargeData.credits} créditos agregados`)
      showRechargeDialog.value = false

      // Recargar detalles del usuario para mostrar el nuevo balance
      await store.dispatch('admin/fetchUserDetails', route.params.id)
    }
  } catch (error) {
    console.error('[AdminUserDetails] Error en recarga:', error)
    const errorMessage = error.response?.data?.error || 'Error al procesar la recarga'
    toast.error(errorMessage)
  } finally {
    rechargeLoading.value = false
  }
}

// Calcular nueva fecha de vencimiento
const calculateNewExpiryDate = () => {
  if (!user.value?.subscription?.expires_at || !extendData.value.months) {
    return '-'
  }

  const currentExpiry = dayjs(user.value.subscription.expires_at)
  const newExpiry = currentExpiry.add(extendData.value.months, 'months')
  return newExpiry.format('DD/MM/YYYY')
}

// Manejar extensión de suscripción
const handleExtendSubscription = async () => {
  const { valid } = await extendFormRef.value.validate()
  if (!valid) return

  try {
    extendLoading.value = true
    console.log('[AdminUserDetails] Extendiendo suscripción:', extendData.value)

    const response = await store.dispatch('admin/extendSubscription', {
      userId: user.value.user_info.id,
      months: extendData.value.months,
      reason: extendData.value.reason
    })

    if (response.success) {
      toast.success(`Suscripción extendida por ${extendData.value.months} mes(es)`)
      showExtendDialog.value = false

      // Reset form
      extendData.value = { months: 1, reason: '' }
      extendFormRef.value?.reset()

      // Recargar detalles del usuario
      await store.dispatch('admin/fetchUserDetails', route.params.id)
    }
  } catch (error) {
    console.error('[AdminUserDetails] Error al extender suscripción:', error)
    const errorMessage = error.response?.data?.error || 'Error al extender suscripción'
    toast.error(errorMessage)
  } finally {
    extendLoading.value = false
  }
}

// Cancelar extensión
const handleCancelExtend = () => {
  showExtendDialog.value = false
  extendData.value = { months: 1, reason: '' }
  extendFormRef.value?.reset()
}

// Manejar cambio de plan
const handleChangePlan = async () => {
  const { valid } = await changePlanFormRef.value.validate()
  if (!valid) return

  try {
    changePlanLoading.value = true

    const response = await store.dispatch('admin/updateUserSubscription', {
      userId: user.value.user_info.id,
      planId: changePlanData.value.plan_name
    })

    if (response.success) {
      toast.success(`Plan cambiado a ${planOptions.find(p => p.value === changePlanData.value.plan_name)?.title}`)
      showChangePlanDialog.value = false

      // Reset form
      changePlanData.value = { plan_name: '', notes: '' }
      changePlanFormRef.value?.reset()

      // Recargar detalles del usuario
      await store.dispatch('admin/fetchUserDetails', route.params.id)
    }
  } catch (error) {
    console.error('[AdminUserDetails] Error al cambiar plan:', error)
    const errorMessage = error.response?.data?.error || 'Error al cambiar plan'
    toast.error(errorMessage)
  } finally {
    changePlanLoading.value = false
  }
}

const handleCancelChangePlan = () => {
  showChangePlanDialog.value = false
  changePlanData.value = { plan_name: '', notes: '' }
  changePlanFormRef.value?.reset()
}

onMounted(() => {
  store.dispatch('admin/fetchUserDetails', route.params.id)
})
</script>

<style scoped>
.admin-user-details {
  max-width: 1600px;
}

.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white !important;
}

.bg-primary :deep(.v-icon),
.bg-primary :deep(.v-card-title) {
  color: white !important;
}

.bg-success {
  background: linear-gradient(135deg, #43a047 0%, #388e3c 100%);
  color: white !important;
}

.bg-success :deep(.v-icon),
.bg-success :deep(.v-card-title),
.bg-success :deep(.v-btn) {
  color: white !important;
}

.bg-gradient-credits {
  background: linear-gradient(135deg, #ff6f00 0%, #f57c00 100%);
  color: white !important;
}

.bg-gradient-credits :deep(.v-icon),
.bg-gradient-credits :deep(.v-card-title) {
  color: white !important;
}

.bg-gradient-extend {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  color: white !important;
}

.bg-gradient-extend :deep(.v-icon),
.bg-gradient-extend :deep(.v-card-title) {
  color: white !important;
}

.bg-gradient-plan {
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
  color: white !important;
}

.bg-gradient-plan :deep(.v-icon),
.bg-gradient-plan :deep(.v-card-title) {
  color: white !important;
}

/* Card hover effects */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Keep dialog inputs readable */
:deep(.v-dialog .v-field__input) {
  color: rgba(0, 0, 0, 0.87) !important;
}

:deep(.v-dialog .v-alert__content) {
  color: inherit !important;
}
</style>
