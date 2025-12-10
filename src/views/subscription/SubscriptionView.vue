<template>
  <div class="subscription-dashboard">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          Mi Suscripción
        </h1>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <template v-else-if="subscription">
      <!-- Alerta de Expiración -->
      <v-row v-if="subscription.expiring_soon || subscription.is_expired">
        <v-col cols="12">
          <ExpirationAlert
            :membership="mappedMembership"
            prominent
            :show-details="true"
            :show-action="true"
          />
        </v-col>
      </v-row>
      <!-- Current Plan Card -->
      <v-row>
        <v-col cols="12" md="8">
          <v-card elevation="4" rounded="xl">
            <v-card-title class="d-flex justify-space-between align-center bg-primary pa-6">
              <div>
                <v-icon class="mr-2">mdi-card-account-details</v-icon>
                Plan Actual
              </div>
              <v-chip
                :color="getStatusColor(subscription.status)"
                size="small"
              >
                {{ getStatusLabel(subscription.status) }}
              </v-chip>
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Plan</div>
                    <div class="d-flex align-center">
                      <div class="text-h5 font-weight-bold mr-3">
                        {{ subscription.plan?.display_name || 'N/A' }}
                      </div>
                      <MembershipBadge
                        :plan-name="subscription.plan?.name || 'free'"
                        :display-name="subscription.plan?.display_name || 'Gratis'"
                        size="small"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Inicio</div>
                    <div class="text-body-1">
                      {{ formatDate(subscription.started_at) }}
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Vencimiento</div>
                    <div class="text-body-1">
                      {{ formatDate(subscription.expires_at) }}
                    </div>
                  </div>

                  <div v-if="subscription.days_remaining !== undefined">
                    <div class="text-caption text-grey mb-1">Días Restantes</div>
                    <div class="text-h6" :class="getDaysRemainingColor(subscription.days_remaining)">
                      {{ subscription.days_remaining }} días
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="d-flex flex-column ga-2">
                    <!-- Botón Renovar (si está próximo a vencer) -->
                    <v-btn
                      v-if="subscription.expiring_soon && subscription.plan?.name !== 'free'"
                      color="success"
                      variant="elevated"
                      prepend-icon="mdi-refresh"
                      @click="showRenewDialog = true"
                      size="large"
                    >
                      Renovar Membresía
                    </v-btn>

                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-rocket-launch"
                      @click="$router.push('/pricing')"
                    >
                      Actualizar Plan
                    </v-btn>

                    <v-btn
                      v-if="subscription.status === 'active' && subscription.plan?.name !== 'free'"
                      color="warning"
                      variant="outlined"
                      prepend-icon="mdi-credit-card"
                      @click="openCustomerPortal"
                      :loading="loadingPortal"
                    >
                      Gestionar Pagos
                    </v-btn>

                    <v-btn
                      v-if="subscription.status === 'active' && subscription.plan?.name !== 'free'"
                      color="error"
                      variant="text"
                      prepend-icon="mdi-cancel"
                      @click="showCancelDialog = true"
                    >
                      Cancelar Suscripción
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Quick Stats -->
        <v-col cols="12" md="4">
          <v-card elevation="4" rounded="xl" color="success-lighten-5">
            <v-card-text class="text-center pa-6">
              <v-icon color="success" size="48" class="mb-3">mdi-check-circle</v-icon>
              <div class="text-h6 mb-2">Estado del Plan</div>
              <div class="text-h4 font-weight-bold text-success">
                {{ subscription.status === 'active' ? 'Activo' : 'Inactivo' }}
              </div>
              <div class="text-caption text-grey mt-2">
                Renovación automática
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Usage Section -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="4" rounded="xl">
            <v-card-title class="pa-6 bg-info">
              <v-icon class="mr-2">mdi-chart-line</v-icon>
              Uso de Mensajes
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Daily Usage -->
              <div class="mb-6">
                <div class="d-flex justify-space-between mb-2">
                  <div class="text-subtitle-1 font-weight-bold">
                    Uso Diario
                  </div>
                  <div class="text-body-2">
                    {{ usage.daily?.sent || 0 }} / {{ usage.daily?.limit || 0 }}
                  </div>
                </div>

                <v-progress-linear
                  :model-value="usage.daily?.percentage || 0"
                  :color="getUsageColor(usage.daily?.percentage || 0)"
                  height="24"
                  rounded
                >
                  <template v-slot:default>
                    <strong class="text-white">{{ usage.daily?.percentage || 0 }}%</strong>
                  </template>
                </v-progress-linear>

                <div class="text-caption text-grey mt-1">
                  Quedan {{ usage.daily?.remaining || 0 }} mensajes disponibles hoy
                </div>
              </div>

              <!-- Monthly Usage -->
              <div>
                <div class="d-flex justify-space-between mb-2">
                  <div class="text-subtitle-1 font-weight-bold">
                    Uso Mensual
                  </div>
                  <div class="text-body-2">
                    {{ usage.monthly?.sent || 0 }} / {{ usage.monthly?.limit || 0 }}
                  </div>
                </div>

                <v-progress-linear
                  :model-value="usage.monthly?.percentage || 0"
                  :color="getUsageColor(usage.monthly?.percentage || 0)"
                  height="24"
                  rounded
                >
                  <template v-slot:default>
                    <strong class="text-white">{{ usage.monthly?.percentage || 0 }}%</strong>
                  </template>
                </v-progress-linear>

                <div class="text-caption text-grey mt-1">
                  Quedan {{ usage.monthly?.remaining || 0 }} mensajes disponibles este mes
                </div>
              </div>

              <!-- Usage Alert -->
              <v-alert
                v-if="usage.daily?.percentage >= 80 || usage.monthly?.percentage >= 80"
                type="warning"
                variant="tonal"
                class="mt-4"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-alert</v-icon>
                </template>
                Has usado más del 80% de tus mensajes. Considera actualizar tu plan.
                <v-btn
                  size="small"
                  color="warning"
                  variant="text"
                  class="ml-2"
                  @click="$router.push('/pricing')"
                >
                  Ver Planes
                </v-btn>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Features & Limits -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card elevation="4" rounded="xl">
            <v-card-title class="pa-6 bg-purple-lighten-4">
              <v-icon class="mr-2">mdi-feature-search</v-icon>
              Características Activas
            </v-card-title>

            <v-card-text class="pa-6">
              <v-list density="compact" class="bg-transparent">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="subscription.features?.advanced_reports ? 'success' : 'grey'">
                      {{ subscription.features?.advanced_reports ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Reportes Avanzados</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="subscription.features?.api_access ? 'success' : 'grey'">
                      {{ subscription.features?.api_access ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Acceso a API</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="subscription.features?.webhooks ? 'success' : 'grey'">
                      {{ subscription.features?.webhooks ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Webhooks</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="subscription.features?.priority_support ? 'success' : 'grey'">
                      {{ subscription.features?.priority_support ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Soporte Prioritario</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="subscription.features?.ai_responses ? 'success' : 'grey'">
                      {{ subscription.features?.ai_responses ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Respuestas con IA</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon :color="!subscription.features?.show_ads ? 'success' : 'grey'">
                      {{ !subscription.features?.show_ads ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Sin Publicidad</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="4" rounded="xl">
            <v-card-title class="pa-6 bg-orange-lighten-4">
              <v-icon class="mr-2">mdi-gauge</v-icon>
              Límites del Plan
            </v-card-title>

            <v-card-text class="pa-6">
              <v-list density="compact" class="bg-transparent">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>
                    Mensajes Diarios: {{ subscription.limits?.daily_messages || 0 }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-email-multiple</v-icon>
                  </template>
                  <v-list-item-title>
                    Mensajes Mensuales: {{ subscription.limits?.monthly_messages || 0 }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-bullhorn</v-icon>
                  </template>
                  <v-list-item-title>
                    Campañas: {{ subscription.limits?.campaigns || 'Ilimitadas' }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-whatsapp</v-icon>
                  </template>
                  <v-list-item-title>
                    Cuentas WhatsApp: {{ subscription.limits?.whatsapp_accounts || 0 }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-contacts</v-icon>
                  </template>
                  <v-list-item-title>
                    Contactos: {{ subscription.limits?.contacts || 'Ilimitados' }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-account-multiple</v-icon>
                  </template>
                  <v-list-item-title>
                    Usuarios: {{ subscription.limits?.users || 0 }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Payment History -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="4" rounded="xl">
            <v-card-title class="pa-6 bg-success-lighten-4 d-flex justify-space-between align-center">
              <div>
                <v-icon class="mr-2">mdi-history</v-icon>
                Historial de Pagos
              </div>
              <v-btn
                size="small"
                color="success"
                variant="text"
                @click="loadPaymentHistory"
                :loading="loadingPayments"
              >
                <v-icon left>mdi-refresh</v-icon>
                Actualizar
              </v-btn>
            </v-card-title>

            <v-card-text class="pa-0">
              <v-data-table
                :headers="paymentHeaders"
                :items="transactions"
                :loading="loadingPayments"
                no-data-text="No hay transacciones registradas"
                loading-text="Cargando transacciones..."
                class="elevation-0"
              >
                <template v-slot:item.created_at="{ item }">
                  {{ formatDate(item.created_at) }}
                </template>

                <template v-slot:item.amount="{ item }">
                  ${{ item.amount }} {{ item.currency }}
                </template>

                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getPaymentStatusColor(item.status)"
                    size="small"
                  >
                    {{ getPaymentStatusLabel(item.status) }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Error State -->
    <v-row v-else>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" color="error-lighten-5">
          <v-card-text class="text-center py-8">
            <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
            <h3 class="text-h5 mb-2">No se pudo cargar la información</h3>
            <p class="text-body-1 mb-4">
              Hubo un error al cargar tu suscripción
            </p>
            <v-btn
              color="error"
              variant="outlined"
              @click="loadSubscription"
            >
              Reintentar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Renew Subscription Dialog -->
    <v-dialog
      v-model="showRenewDialog"
      max-width="500"
      persistent
    >
      <v-card rounded="xl">
        <v-card-title class="bg-success pa-6">
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Renovar Membresía
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Cuántos días deseas extender tu membresía?
          </p>

          <v-text-field
            v-model.number="renewDays"
            type="number"
            label="Días"
            :min="1"
            :max="365"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            hint="Ingresa un número entre 1 y 365"
            persistent-hint
          ></v-text-field>

          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-caption">
              Tu membresía se extenderá {{ renewDays }} días desde la fecha de vencimiento actual.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showRenewDialog = false"
            :disabled="renewing"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="renewSubscription"
            :loading="renewing"
            :disabled="!renewDays || renewDays < 1 || renewDays > 365"
          >
            Renovar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Subscription Dialog -->
    <v-dialog
      v-model="showCancelDialog"
      max-width="500"
      persistent
    >
      <v-card rounded="xl">
        <v-card-title class="bg-error pa-6">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Cancelar Suscripción
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Estás seguro de que quieres cancelar tu suscripción?
          </p>
          <p class="text-body-2 text-grey">
            Tu plan seguirá activo hasta la fecha de vencimiento, pero no se renovará automáticamente.
          </p>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showCancelDialog = false"
            :disabled="cancelling"
          >
            No, mantener
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="cancelSubscription"
            :loading="cancelling"
          >
            Sí, cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { subscriptionService } from '@/services/subscriptionService'
import dayjs from 'dayjs'
import MembershipBadge from '@/components/subscription/MembershipBadge.vue'
import ExpirationAlert from '@/components/subscription/ExpirationAlert.vue'

const router = useRouter()
const toast = useToast()

// Estado
const loading = ref(false)
const loadingPayments = ref(false)
const loadingPortal = ref(false)
const cancelling = ref(false)
const renewing = ref(false)
const subscription = ref(null)
const usage = ref({})
const transactions = ref([])
const showCancelDialog = ref(false)
const showRenewDialog = ref(false)
const renewDays = ref(30)

// Headers de la tabla de pagos
const paymentHeaders = [
  { title: 'Fecha', key: 'created_at', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Estado', key: 'status', sortable: true }
]

// Métodos
const formatDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    cancelled: 'error',
    expired: 'warning',
    pending: 'info'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Activo',
    cancelled: 'Cancelado',
    expired: 'Expirado',
    pending: 'Pendiente'
  }
  return labels[status] || status
}

const getUsageColor = (percentage) => {
  if (percentage >= 90) return 'error'
  if (percentage >= 80) return 'warning'
  if (percentage >= 60) return 'orange'
  return 'success'
}

const getPaymentStatusColor = (status) => {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'info'
  }
  return colors[status] || 'grey'
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  }
  return labels[status] || status
}

const getDaysRemainingColor = (days) => {
  if (days <= 7) return 'text-error font-weight-bold'
  if (days <= 30) return 'text-warning font-weight-bold'
  return 'text-success font-weight-bold'
}

// Mapear subscription al formato esperado por ExpirationAlert
const mappedMembership = computed(() => {
  if (!subscription.value) return null

  return {
    expiringSoon: subscription.value.expiring_soon || false,
    isExpired: subscription.value.is_expired || false,
    daysRemaining: subscription.value.days_remaining || 0,
    expiresAt: subscription.value.expires_at,
    plan: {
      displayName: subscription.value.plan?.display_name || 'N/A'
    }
  }
})

const loadSubscription = async () => {
  try {
    loading.value = true

    const response = await subscriptionService.getMySubscription()

    if (response.success) {
      subscription.value = response.subscription
      usage.value = response.usage || {}
    }
  } catch (error) {
    console.error('Error loading subscription:', error)
    toast.error('Error al cargar la suscripción')
  } finally {
    loading.value = false
  }
}

const loadPaymentHistory = async () => {
  try {
    loadingPayments.value = true

    const response = await subscriptionService.getPaymentHistory()

    if (response.success) {
      transactions.value = response.transactions || []
    }
  } catch (error) {
    console.error('Error loading payment history:', error)
    toast.error('Error al cargar el historial de pagos')
  } finally {
    loadingPayments.value = false
  }
}

const openCustomerPortal = async () => {
  try {
    loadingPortal.value = true

    const response = await subscriptionService.getCustomerPortal()

    if (response.success && response.url) {
      window.location.href = response.url
    }
  } catch (error) {
    console.error('Error opening customer portal:', error)
    toast.error('Error al abrir el portal de pagos')
  } finally {
    loadingPortal.value = false
  }
}

const renewSubscription = async () => {
  try {
    renewing.value = true

    const response = await subscriptionService.renewSubscription(renewDays.value)

    if (response.success) {
      toast.success(response.message || 'Membresía renovada exitosamente')
      showRenewDialog.value = false
      await loadSubscription()
    }
  } catch (error) {
    console.error('Error renewing subscription:', error)
    toast.error(error.response?.data?.message || 'Error al renovar la membresía')
  } finally {
    renewing.value = false
  }
}

const cancelSubscription = async () => {
  try {
    cancelling.value = true

    const response = await subscriptionService.cancelSubscription()

    if (response.success) {
      toast.success(response.message || 'Suscripción cancelada exitosamente')
      showCancelDialog.value = false
      await loadSubscription()
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    toast.error(error.response?.data?.message || 'Error al cancelar la suscripción')
  } finally {
    cancelling.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadSubscription(),
    loadPaymentHistory()
  ])
})
</script>

<style scoped>
.subscription-dashboard {
  padding: 24px;
}

.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.bg-info {
  background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
  color: white;
}

.bg-purple-lighten-4 {
  background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
}

.bg-orange-lighten-4 {
  background: linear-gradient(135deg, #ffe0b2 0%, #ffcc80 100%);
}

.bg-success-lighten-4 {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
}

.bg-error {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
}

.v-progress-linear {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .subscription-dashboard {
    padding: 16px;
  }
}
</style>
