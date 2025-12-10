<template>
  <div class="admin-subscriptions">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">
          Gestión de Membresías
        </h1>
        <p class="text-body-1 text-grey">
          Administra y monitorea todas las suscripciones de usuarios
        </p>
      </v-col>
    </v-row>

    <!-- Expiring Soon Alert -->
    <v-row v-if="expiringSoon.length > 0" class="mt-4">
      <v-col cols="12">
        <v-alert
          type="warning"
          variant="tonal"
          prominent
          border="start"
        >
          <template v-slot:prepend>
            <v-icon size="large">mdi-alert-circle</v-icon>
          </template>

          <template v-slot:title>
            <span class="font-weight-bold">Membresías por Vencer</span>
          </template>

          <div class="text-body-2 mb-3">
            Hay <strong>{{ expiringSoon.length }}</strong> membresías que vencen en los próximos 7 días
          </div>

          <v-btn
            color="warning"
            variant="elevated"
            size="small"
            @click="showExpiringDialog = true"
          >
            Ver Detalles
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mt-4">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="filters.search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por email"
          variant="outlined"
          density="comfortable"
          clearable
          @input="handleSearch"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          label="Estado"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="loadSubscriptions"
        ></v-select>
      </v-col>

      <v-col cols="12" md="2">
        <v-select
          v-model="filters.plan_id"
          :items="planOptions"
          label="Plan"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="loadSubscriptions"
        ></v-select>
      </v-col>

      <v-col cols="12" md="3">
        <v-btn-toggle
          v-model="filters.expiring"
          variant="outlined"
          divided
          density="comfortable"
          color="warning"
          @update:model-value="loadSubscriptions"
        >
          <v-btn value="all">
            Todas
          </v-btn>
          <v-btn value="expiring">
            Por Vencer
          </v-btn>
        </v-btn-toggle>
      </v-col>

      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          variant="elevated"
          block
          size="large"
          prepend-icon="mdi-refresh"
          @click="loadAll"
          :loading="loading"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading && subscriptions.length === 0" class="mt-4">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Subscriptions Table -->
    <v-row v-else-if="subscriptions.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Días Rest.</th>
                  <th>Inicio</th>
                  <th>Vencimiento</th>
                  <th class="text-center">Auto-Renovar</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sub in subscriptions" :key="sub.id" :class="{ 'bg-warning-lighten-5': sub.expiring_soon }">
                  <td class="text-grey">#{{ sub.id }}</td>
                  <td>{{ sub.user_name || '-' }}</td>
                  <td>{{ sub.user_email }}</td>
                  <td>
                    <MembershipBadge
                      :plan-name="sub.plan_name"
                      :display-name="sub.plan_display_name"
                      size="x-small"
                    />
                  </td>
                  <td class="font-weight-bold">${{ sub.price }}</td>
                  <td>
                    <v-chip
                      :color="getStatusColor(sub.status)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ sub.status_display }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <span :class="getDaysRemainingClass(sub.days_remaining)">
                      {{ sub.days_remaining }}
                    </span>
                  </td>
                  <td class="text-caption">{{ formatDate(sub.started_at) }}</td>
                  <td class="text-caption">{{ formatDate(sub.expires_at) }}</td>
                  <td class="text-center">
                    <v-icon
                      :color="sub.auto_renew ? 'success' : 'grey'"
                      size="small"
                    >
                      {{ sub.auto_renew ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                  </td>
                  <td>
                    <div class="d-flex justify-center ga-1">
                      <v-btn
                        size="small"
                        color="success"
                        variant="tonal"
                        icon="mdi-calendar-plus"
                        @click="openExtendModal(sub)"
                      >
                      </v-btn>

                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            color="orange"
                            variant="tonal"
                            icon="mdi-cog"
                          >
                          </v-btn>
                        </template>

                        <v-list density="compact">
                          <v-list-item
                            v-for="status in statusChangeOptions"
                            :key="status.value"
                            @click="changeStatus(sub.id, status.value)"
                            :disabled="sub.status === status.value"
                          >
                            <v-list-item-title>
                              {{ status.label }}
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>

                      <v-btn
                        size="small"
                        color="primary"
                        variant="tonal"
                        icon="mdi-account"
                        @click="$router.push(`/admin/users/${sub.user_id}`)"
                      >
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>

          <!-- Pagination -->
          <v-card-actions v-if="pagination.total_pages > 1" class="pa-4">
            <v-pagination
              v-model="filters.page"
              :length="pagination.total_pages"
              :total-visible="7"
              @update:model-value="loadSubscriptions"
            ></v-pagination>

            <v-spacer></v-spacer>

            <div class="text-caption text-grey">
              Total: {{ pagination.total }} suscripciones
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Results -->
    <v-row v-else class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-credit-card-off</v-icon>
            <p class="text-h6 mt-4">No se encontraron suscripciones</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Expiring Subscriptions Dialog -->
    <v-dialog v-model="showExpiringDialog" max-width="900">
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-warning text-white">
          <v-icon class="mr-2">mdi-alert-circle</v-icon>
          Membresías Por Vencer (Próximos 7 Días)
        </v-card-title>

        <v-card-text class="pa-4">
          <v-table density="compact">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Plan</th>
                <th>Días Restantes</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in expiringSoon" :key="sub.id">
                <td>
                  <div class="text-body-2 font-weight-bold">{{ sub.user_name }}</div>
                  <div class="text-caption text-grey">{{ sub.user_email }}</div>
                </td>
                <td>
                  <MembershipBadge
                    :plan-name="sub.plan_name"
                    :display-name="sub.plan_display_name"
                    size="x-small"
                  />
                </td>
                <td>
                  <span :class="getDaysRemainingClass(sub.days_remaining)">
                    {{ sub.days_remaining }} días
                  </span>
                </td>
                <td class="text-caption">{{ formatDate(sub.expires_at) }}</td>
                <td>
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="tonal"
                    @click="openExtendModal(sub)"
                  >
                    Extender
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="showExpiringDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Extend Membership Modal -->
    <ExtendMembershipModal
      v-model="showExtendModal"
      :user="selectedSubscription"
      :loading="extending"
      @confirm="handleExtendMembership"
    />

    <!-- Change Status Dialog -->
    <v-dialog v-model="showStatusDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-orange">
          <v-icon class="mr-2">mdi-information</v-icon>
          Cambiar Estado de Suscripción
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Estás seguro de cambiar el estado de la suscripción a
            <strong>{{ getStatusLabel(pendingStatusChange.newStatus) }}</strong>?
          </p>

          <v-alert type="info" variant="tonal">
            Este cambio afectará el acceso del usuario inmediatamente.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelStatusChange"
            :disabled="changingStatus"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="orange"
            variant="elevated"
            @click="confirmStatusChange"
            :loading="changingStatus"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { subscriptionService } from '@/services/subscriptionService'
import MembershipBadge from '@/components/subscription/MembershipBadge.vue'
import ExtendMembershipModal from '@/components/admin/ExtendMembershipModal.vue'
import dayjs from 'dayjs'

const toast = useToast()

// State
const loading = ref(false)
const subscriptions = ref([])
const expiringSoon = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  total_pages: 0
})

const filters = reactive({
  search: '',
  status: '',
  plan_id: '',
  expiring: 'all',
  page: 1,
  limit: 20
})

const showExpiringDialog = ref(false)
const showExtendModal = ref(false)
const showStatusDialog = ref(false)
const selectedSubscription = ref(null)
const extending = ref(false)
const changingStatus = ref(false)
const pendingStatusChange = reactive({
  subscriptionId: null,
  newStatus: ''
})

let searchTimeout = null

// Options
const statusOptions = [
  { title: 'Activa', value: 'active' },
  { title: 'Cancelada', value: 'cancelled' },
  { title: 'Expirada', value: 'expired' },
  { title: 'Suspendida', value: 'suspended' },
  { title: 'Prueba', value: 'trial' }
]

const statusChangeOptions = [
  { label: 'Activar', value: 'active' },
  { label: 'Cancelar', value: 'cancelled' },
  { label: 'Suspender', value: 'suspended' },
  { label: 'Marcar Expirada', value: 'expired' }
]

const planOptions = [
  { title: 'Gratuito', value: 1 },
  { title: 'Pro', value: 2 },
  { title: 'Premium', value: 3 },
  { title: 'Enterprise', value: 4 }
]

// Methods
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadSubscriptions()
  }, 500)
}

const loadSubscriptions = async () => {
  try {
    loading.value = true

    const params = {
      page: filters.page,
      limit: filters.limit
    }

    if (filters.search) params.search = filters.search
    if (filters.status) params.status = filters.status
    if (filters.plan_id) params.plan_id = filters.plan_id

    const response = await subscriptionService.getAdminSubscriptions(params)

    if (response.success) {
      subscriptions.value = response.subscriptions || []
      pagination.value = response.pagination || {}
    }
  } catch (error) {
    console.error('Error loading subscriptions:', error)
    toast.error('Error al cargar suscripciones')
  } finally {
    loading.value = false
  }
}

const loadExpiringSoon = async () => {
  try {
    const response = await subscriptionService.getExpiringSubscriptions(7)

    if (response.success) {
      expiringSoon.value = response.subscriptions || []
    }
  } catch (error) {
    console.error('Error loading expiring subscriptions:', error)
  }
}

const loadAll = async () => {
  await Promise.all([loadSubscriptions(), loadExpiringSoon()])
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('DD/MM/YYYY')
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    cancelled: 'error',
    expired: 'warning',
    suspended: 'orange',
    trial: 'info'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const option = statusOptions.find(s => s.value === status)
  return option ? option.title : status
}

const getDaysRemainingClass = (days) => {
  if (days <= 7) return 'text-error font-weight-bold'
  if (days <= 30) return 'text-warning font-weight-bold'
  return 'text-success font-weight-bold'
}

const openExtendModal = (subscription) => {
  selectedSubscription.value = {
    id: subscription.user_id,
    name: subscription.user_name,
    email: subscription.user_email,
    plan_display_name: subscription.plan_display_name,
    subscription_expires: subscription.expires_at,
    days_remaining: subscription.days_remaining
  }
  showExtendModal.value = true
}

const handleExtendMembership = async (days) => {
  try {
    extending.value = true

    await subscriptionService.extendUserSubscription(selectedSubscription.value.id, days)

    toast.success(`Membresía extendida ${days} días exitosamente`)
    showExtendModal.value = false
    selectedSubscription.value = null

    await loadAll()
  } catch (error) {
    console.error('Error extending membership:', error)
    toast.error(error.response?.data?.message || 'Error al extender membresía')
  } finally {
    extending.value = false
  }
}

const changeStatus = (subscriptionId, newStatus) => {
  pendingStatusChange.subscriptionId = subscriptionId
  pendingStatusChange.newStatus = newStatus
  showStatusDialog.value = true
}

const confirmStatusChange = async () => {
  try {
    changingStatus.value = true

    await subscriptionService.updateSubscriptionStatus(
      pendingStatusChange.subscriptionId,
      pendingStatusChange.newStatus
    )

    toast.success('Estado actualizado correctamente')
    showStatusDialog.value = false

    await loadAll()
  } catch (error) {
    console.error('Error changing status:', error)
    toast.error(error.response?.data?.message || 'Error al cambiar estado')
  } finally {
    changingStatus.value = false
  }
}

const cancelStatusChange = () => {
  showStatusDialog.value = false
  pendingStatusChange.subscriptionId = null
  pendingStatusChange.newStatus = ''
}

// Lifecycle
onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.admin-subscriptions {
  max-width: 1800px;
}

.bg-warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.bg-orange {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%);
  color: white;
}

.bg-warning-lighten-5 {
  background-color: #fff3e0 !important;
}

:deep(.v-table thead tr th) {
  background: #f5f5f5 !important;
  font-weight: 600;
  white-space: nowrap;
}

:deep(.v-table tbody tr:hover) {
  background: #f8f9fa !important;
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
