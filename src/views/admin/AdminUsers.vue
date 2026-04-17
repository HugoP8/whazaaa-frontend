<template>
  <div class="admin-users">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">
          Gestión de Usuarios
        </h1>
        <p class="text-body-1 text-grey">
          Administra usuarios, roles y suscripciones
        </p>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filters.search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar por email o nombre"
          variant="outlined"
          density="comfortable"
          clearable
          @input="handleSearch"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filters.role"
          :items="roleOptions"
          label="Filtrar por rol"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="loadUsers"
        ></v-select>
      </v-col>

      <v-col cols="12" md="3">
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          label="Filtrar por estado"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="loadUsers"
        ></v-select>
      </v-col>

      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          variant="elevated"
          block
          size="large"
          prepend-icon="mdi-refresh"
          @click="loadUsers"
          :loading="loading"
        >
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading && users.length === 0" class="mt-4">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-row v-else-if="users.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Plan</th>
                  <th class="text-center">Estado</th>
                  <th class="text-center">Días Rest.</th>
                  <th>Vencimiento</th>
                  <th class="text-center">Campañas</th>
                  <th class="text-center">Mensajes</th>
                  <th class="text-right">Gastado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="text-grey">{{ user.id }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.name || '-' }}</td>
                  <td>
                    <v-chip
                      :color="getRoleColor(user.role)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getRoleLabel(user.role) }}
                    </v-chip>
                  </td>
                  <td>
                    <MembershipBadge
                      :plan-name="user.plan_name || 'free'"
                      :display-name="user.plan_display_name || 'Gratis'"
                      size="x-small"
                    />
                  </td>
                  <td class="text-center">
                    <v-chip
                      :color="getStatusColor(user.subscription_status)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ user.membership_status_display || 'N/A' }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <span
                      v-if="user.days_remaining !== undefined"
                      :class="getDaysRemainingClass(user.days_remaining)"
                    >
                      {{ user.days_remaining }}
                    </span>
                    <span v-else class="text-grey">-</span>
                  </td>
                  <td>
                    <span v-if="user.subscription_expires" class="text-caption">
                      {{ formatDate(user.subscription_expires) }}
                    </span>
                    <span v-else class="text-grey">-</span>
                  </td>
                  <td class="text-center font-weight-bold">
                    {{ user.total_campaigns || 0 }}
                  </td>
                  <td class="text-center font-weight-bold">
                    {{ user.total_messages_sent || 0 }}
                  </td>
                  <td class="text-right font-weight-bold text-success">
                    ${{ parseFloat(user.total_spent || 0).toFixed(2) }}
                  </td>
                  <td>
                    <div class="d-flex justify-center ga-1">
                      <!-- Extender Membresía -->
                      <v-tooltip text="Extender suscripción" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            color="success"
                            variant="tonal"
                            icon="mdi-calendar-plus"
                            @click="openExtendModal(user)"
                            :disabled="!user.subscription_id"
                          >
                          </v-btn>
                        </template>
                      </v-tooltip>

                      <!-- Cambiar Plan -->
                      <v-tooltip text="Cambiar plan de suscripción" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            color="purple"
                            variant="tonal"
                            icon="mdi-crown"
                            @click="openChangePlanModal(user)"
                          >
                          </v-btn>
                        </template>
                      </v-tooltip>

                      <!-- Ver Detalles -->
                      <v-tooltip text="Ver detalles del usuario" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            size="small"
                            color="primary"
                            variant="tonal"
                            icon="mdi-eye"
                            @click="$router.push(`/admin/users/${user.id}`)"
                          >
                          </v-btn>
                        </template>
                      </v-tooltip>

                      <!-- Cambiar Rol -->
                      <v-tooltip text="Cambiar rol del usuario" location="top">
                        <template v-slot:activator="{ props }">
                          <v-menu>
                            <template v-slot:activator="{ props: menuProps }">
                              <v-btn
                                v-bind="{ ...props, ...menuProps }"
                                size="small"
                                color="orange"
                                variant="tonal"
                                icon="mdi-account-cog"
                                :disabled="user.role === 'superadmin' && !isSuperAdmin"
                              >
                              </v-btn>
                            </template>

                            <v-list density="compact">
                              <v-list-subheader>Cambiar rol a:</v-list-subheader>
                              <v-list-item
                                v-for="role in availableRoles(user)"
                                :key="role.value"
                                @click="changeRole(user.id, role.value)"
                              >
                                <template v-slot:prepend>
                                  <v-icon :color="getRoleColor(role.value)">
                                    mdi-account-{{ role.value === 'admin' ? 'star' : role.value === 'superadmin' ? 'key' : 'circle' }}
                                  </v-icon>
                                </template>
                                <v-list-item-title>
                                  {{ role.label }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </template>
                      </v-tooltip>
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
              @update:model-value="loadUsers"
            ></v-pagination>

            <v-spacer></v-spacer>

            <div class="text-caption text-grey">
              Total: {{ pagination.total }} usuarios
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
            <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
            <p class="text-h6 mt-4">No se encontraron usuarios</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Extend Membership Modal -->
    <ExtendMembershipModal
      v-model="showExtendModal"
      :user="selectedUser"
      :loading="extending"
      @confirm="handleExtendMembership"
    />

    <!-- Change Plan Dialog -->
    <v-dialog v-model="showChangePlanDialog" max-width="700" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-purple">
          <v-icon class="mr-2">mdi-crown</v-icon>
          Cambiar Plan de Suscripción (Sin Pago)
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Cambia el plan de <strong>{{ selectedUser?.email }}</strong>
          </p>

          <v-alert v-if="selectedUser" type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Plan actual:</strong> {{ selectedUser.plan_display_name || 'Gratis' }}
            </div>
            <div class="text-caption mt-1" v-if="selectedUser.subscription_expires">
              Vence: {{ formatDate(selectedUser.subscription_expires) }}
            </div>
          </v-alert>

          <v-row>
            <v-col cols="12" md="7">
              <v-select
                v-model="newPlan"
                :items="availablePlans"
                item-title="display_name"
                item-value="name"
                label="Selecciona el nuevo plan *"
                variant="outlined"
                prepend-inner-icon="mdi-package-variant"
                :rules="[v => !!v || 'Debes seleccionar un plan']"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="getPlanColor(item.raw.name)">mdi-crown</v-icon>
                    </template>
                    <v-list-item-subtitle>
                      Precio referencial: ${{ item.raw.price }}/mes
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="5">
              <v-select
                v-model="planDuration"
                :items="durationOptions"
                label="Duración *"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-month"
                :rules="[v => !!v || 'Debes seleccionar duración']"
              ></v-select>
            </v-col>
          </v-row>

          <v-alert type="success" variant="tonal" class="mb-4">
            <v-icon class="mr-2">mdi-information</v-icon>
            <strong>Cambio Manual de Plan:</strong> Este cambio NO requiere pago.
            El usuario recibirá el plan seleccionado por el período indicado.
          </v-alert>

          <v-divider class="my-4"></v-divider>

          <div class="text-body-2 pa-3 bg-grey-lighten-4 rounded">
            <div class="mb-2"><strong>Resumen del cambio:</strong></div>
            <div class="d-flex justify-space-between mb-1">
              <span>Plan:</span>
              <strong>{{ getPlanName(newPlan) }}</strong>
            </div>
            <div class="d-flex justify-space-between mb-1">
              <span>Duración:</span>
              <strong>{{ getDurationLabel(planDuration) }}</strong>
            </div>
            <div class="d-flex justify-space-between">
              <span>Nueva fecha de vencimiento:</span>
              <strong class="text-success">{{ calculateNewExpiryDate() }}</strong>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelChangePlan"
            :disabled="changingPlan"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="purple"
            variant="elevated"
            @click="confirmChangePlan"
            :loading="changingPlan"
            :disabled="!newPlan || !planDuration"
          >
            <v-icon class="mr-2">mdi-check</v-icon>
            Aplicar Cambio
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Change Role Dialog -->
    <v-dialog v-model="showRoleDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-warning">
          <v-icon class="mr-2">mdi-alert</v-icon>
          Cambiar Rol de Usuario
        </v-card-title>

        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            ¿Estás seguro de cambiar el rol del usuario a
            <strong>{{ getRoleLabel(pendingRoleChange.newRole) }}</strong>?
          </p>

          <v-alert type="warning" variant="tonal">
            Esta acción cambiará los permisos del usuario inmediatamente.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelRoleChange"
            :disabled="changingRole"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            @click="confirmRoleChange"
            :loading="changingRole"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { subscriptionService } from '@/services/subscriptionService'
import MembershipBadge from '@/components/subscription/MembershipBadge.vue'
import ExtendMembershipModal from '@/components/admin/ExtendMembershipModal.vue'
import dayjs from 'dayjs'

const store = useStore()
const toast = useToast()

// State
const filters = reactive({
  search: '',
  role: '',
  status: '',
  page: 1,
  limit: 20
})

const showRoleDialog = ref(false)
const changingRole = ref(false)
const pendingRoleChange = reactive({
  userId: null,
  newRole: ''
})

const showExtendModal = ref(false)
const selectedUser = ref(null)
const extending = ref(false)

const showChangePlanDialog = ref(false)
const changingPlan = ref(false)
const newPlan = ref('')
const planDuration = ref(1)

const availablePlans = ref([
  { name: 'free', display_name: 'Plan Gratuito', price: '0.00' },
  { name: 'pro', display_name: 'Plan Profesional', price: '24.99' },
  { name: 'business', display_name: 'Plan Empresarial', price: '89.99' }
])

const durationOptions = [
  { title: '1 mes', value: 1 },
  { title: '2 meses', value: 2 },
  { title: '3 meses', value: 3 },
  { title: '6 meses', value: 6 },
  { title: '12 meses (1 año)', value: 12 },
  { title: '24 meses (2 años)', value: 24 },
  { title: '36 meses (3 años)', value: 36 }
]

let searchTimeout = null

// Computed
const loading = computed(() => store.getters['admin/loading'])
const users = computed(() => store.getters['admin/users'])
const pagination = computed(() => store.getters['admin/usersPagination'])
const isSuperAdmin = computed(() => store.getters['auth/isSuperAdmin'])

// Options
const roleOptions = [
  { title: 'Usuario', value: 'user' },
  { title: 'Admin', value: 'admin' },
  { title: 'Super Admin', value: 'superadmin' }
]

const statusOptions = [
  { title: 'Activo', value: 'active' },
  { title: 'Cancelado', value: 'cancelled' },
  { title: 'Expirado', value: 'expired' }
]

// Methods
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.page = 1
    loadUsers()
  }, 500)
}

const loadUsers = async () => {
  try {
    await store.dispatch('admin/fetchUsers', filters)
  } catch (error) {
    console.error('Error loading users:', error)
    toast.error('Error al cargar usuarios')
  }
}

const getRoleColor = (role) => {
  const colors = {
    user: 'blue',
    admin: 'amber-darken-2',
    superadmin: 'pink-darken-2'
  }
  return colors[role] || 'grey'
}

const getRoleLabel = (role) => {
  const labels = {
    user: 'Usuario',
    admin: 'Admin',
    superadmin: 'Super Admin'
  }
  return labels[role] || role
}

const getPlanColor = (planName) => {
  const colors = {
    free: 'grey',
    pro: 'primary',
    premium: 'purple',
    enterprise: 'orange'
  }
  return colors[planName] || 'grey'
}

const availableRoles = (user) => {
  // Solo superadmin puede cambiar roles de otros superadmin
  if (user.role === 'superadmin' && !isSuperAdmin.value) {
    return []
  }

  return roleOptions.filter(role => role.value !== user.role)
}

const changeRole = (userId, newRole) => {
  pendingRoleChange.userId = userId
  pendingRoleChange.newRole = newRole
  showRoleDialog.value = true
}

const confirmRoleChange = async () => {
  try {
    changingRole.value = true

    await store.dispatch('admin/updateUserRole', {
      userId: pendingRoleChange.userId,
      role: pendingRoleChange.newRole
    })

    toast.success('Rol actualizado correctamente')
    showRoleDialog.value = false

    // Recargar usuarios
    await loadUsers()
  } catch (error) {
    console.error('Error changing role:', error)
    toast.error(error.response?.data?.error || 'Error al cambiar rol')
  } finally {
    changingRole.value = false
  }
}

const cancelRoleChange = () => {
  showRoleDialog.value = false
  pendingRoleChange.userId = null
  pendingRoleChange.newRole = ''
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

const getDaysRemainingClass = (days) => {
  if (days <= 7) return 'text-error font-weight-bold'
  if (days <= 30) return 'text-warning font-weight-bold'
  return 'text-success font-weight-bold'
}

const openExtendModal = (user) => {
  selectedUser.value = user
  showExtendModal.value = true
}

const handleExtendMembership = async (days) => {
  try {
    extending.value = true

    await subscriptionService.extendUserSubscription(selectedUser.value.id, days)

    toast.success(`Membresía extendida ${days} días exitosamente`)
    showExtendModal.value = false
    selectedUser.value = null

    // Recargar usuarios
    await loadUsers()
  } catch (error) {
    console.error('Error extending membership:', error)
    toast.error(error.response?.data?.message || 'Error al extender membresía')
  } finally {
    extending.value = false
  }
}

const openChangePlanModal = (user) => {
  selectedUser.value = user
  newPlan.value = user.plan_name || 'free'
  planDuration.value = 1
  showChangePlanDialog.value = true
}

const cancelChangePlan = () => {
  showChangePlanDialog.value = false
  selectedUser.value = null
  newPlan.value = ''
  planDuration.value = 1
}

const confirmChangePlan = async () => {
  try {
    changingPlan.value = true

    // Enviar plan y duración en meses al backend
    await subscriptionService.changeUserPlan(
      selectedUser.value.id,
      newPlan.value,
      planDuration.value
    )

    toast.success(`Plan cambiado a ${getPlanName(newPlan.value)} por ${planDuration.value} ${planDuration.value === 1 ? 'mes' : 'meses'}`)
    showChangePlanDialog.value = false
    selectedUser.value = null
    newPlan.value = ''
    planDuration.value = 1

    // Recargar usuarios
    await loadUsers()
  } catch (error) {
    console.error('Error changing plan:', error)
    toast.error(error.response?.data?.message || error.response?.data?.error || 'Error al cambiar plan')
  } finally {
    changingPlan.value = false
  }
}

const getPlanName = (planName) => {
  const plan = availablePlans.value.find(p => p.name === planName)
  return plan ? plan.display_name : planName
}

const getDurationLabel = (months) => {
  const option = durationOptions.find(d => d.value === months)
  return option ? option.title : `${months} ${months === 1 ? 'mes' : 'meses'}`
}

const calculateNewExpiryDate = () => {
  if (!planDuration.value) return '-'

  const today = dayjs()
  const newExpiry = today.add(planDuration.value, 'month')
  return newExpiry.format('DD/MM/YYYY')
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  max-width: 1600px;
}

.bg-warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white !important;
}

.bg-warning :deep(*) {
  color: white !important;
}

.bg-purple {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white !important;
}

.bg-purple :deep(*) {
  color: white !important;
}

:deep(.v-table thead tr th) {
  background: #f8fafc !important;
  font-weight: 600;
  white-space: nowrap;
  color: #374151 !important;
}

:deep(.v-table tbody tr:hover) {
  background: #f1f5f9 !important;
}

/* Card animations */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Fix for dialogs - nested alert styles */
:deep(.v-dialog .v-alert__content *) {
  color: inherit !important;
}

/* Keep input text colors readable in dialogs */
:deep(.v-dialog .v-field__input) {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
