<template>
  <div class="admin-recharge-requests">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h4 font-weight-bold">
            <v-icon class="mr-2">mdi-wallet-plus</v-icon>
            Solicitudes de Recarga
          </h1>
          <v-spacer></v-spacer>
          <v-btn
            prepend-icon="mdi-refresh"
            variant="outlined"
            @click="loadRequests"
            :loading="loading"
          >
            Actualizar
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon color="warning" size="40" class="mb-2">mdi-clock-outline</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.pending || 0 }}</div>
            <div class="text-caption text-grey">Pendientes</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon color="success" size="40" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.approved || 0 }}</div>
            <div class="text-caption text-grey">Aprobadas Hoy</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon color="error" size="40" class="mb-2">mdi-close-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.rejected || 0 }}</div>
            <div class="text-caption text-grey">Rechazadas Hoy</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-6">
            <v-icon color="primary" size="40" class="mb-2">mdi-currency-usd</v-icon>
            <div class="text-h5 font-weight-bold">{{ stats.totalAmount || 0 }} BS</div>
            <div class="text-caption text-grey">Total Pendiente</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Requests Table -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
            Solicitudes Pendientes
          </v-card-title>

          <v-card-text>
            <!-- Search -->
            <v-text-field
              v-model="search"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="mb-4"
            ></v-text-field>

            <!-- Loading State -->
            <template v-if="loading">
              <v-skeleton-loader type="table" class="mt-4"></v-skeleton-loader>
            </template>

            <!-- Table -->
            <template v-else>
              <v-data-table
                :headers="headers"
                :items="pendingRequests"
                :search="search"
                :items-per-page="10"
                :loading="loading"
              >
                <!-- User -->
                <template v-slot:item.user="{ item }">
                  <div>
                    <div class="font-weight-medium">{{ item.user_email }}</div>
                    <div class="text-caption text-grey">ID: {{ item.user_id }}</div>
                  </div>
                </template>

                <!-- Credits -->
                <template v-slot:item.credits="{ item }">
                  <v-chip color="primary" size="small">
                    {{ item.credits_requested }} + {{ item.bonus_credits }}
                    <v-icon end size="14">mdi-lightning-bolt</v-icon>
                  </v-chip>
                  <div class="text-caption text-grey">
                    Total: {{ item.credits_requested + item.bonus_credits }}
                  </div>
                </template>

                <!-- Price -->
                <template v-slot:item.price="{ item }">
                  <div class="font-weight-bold">{{ item.price }} BS</div>
                </template>

                <!-- Seller -->
                <template v-slot:item.seller="{ item }">
                  <div>
                    <div>{{ item.seller_name }}</div>
                    <div class="text-caption text-grey">
                      <v-icon size="12">mdi-whatsapp</v-icon>
                      {{ item.seller_whatsapp }}
                    </div>
                  </div>
                </template>

                <!-- Date -->
                <template v-slot:item.created_at="{ item }">
                  {{ formatDate(item.created_at) }}
                </template>

                <!-- Actions -->
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex gap-2">
                    <v-btn
                      size="small"
                      color="success"
                      variant="elevated"
                      @click="openApproveDialog(item)"
                      prepend-icon="mdi-check"
                    >
                      Aprobar
                    </v-btn>
                    <v-btn
                      size="small"
                      color="error"
                      variant="outlined"
                      @click="openRejectDialog(item)"
                      prepend-icon="mdi-close"
                    >
                      Rechazar
                    </v-btn>
                  </div>
                </template>

                <!-- No Data -->
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-inbox</v-icon>
                    <p class="text-h6 text-grey mt-4">No hay solicitudes pendientes</p>
                  </div>
                </template>
              </v-data-table>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Approve Dialog -->
    <v-dialog v-model="approveDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-success">
          <v-icon class="mr-2">mdi-check-circle</v-icon>
          Aprobar Recarga
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              Usuario: <strong>{{ selectedRequest?.user_email }}</strong><br>
              Créditos: <strong>{{ selectedRequest?.credits_requested + selectedRequest?.bonus_credits }}</strong><br>
              Precio: <strong>{{ selectedRequest?.price }} BS</strong><br>
              Vendedor: <strong>{{ selectedRequest?.seller_name }}</strong>
            </div>
          </v-alert>

          <v-textarea
            v-model="approveNotes"
            label="Notas de aprobación"
            variant="outlined"
            rows="3"
            prepend-inner-icon="mdi-note-text"
            hint="Ej: Pago verificado - Referencia: ABC123"
            persistent-hint
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="closeApproveDialog"
            :disabled="processing"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="elevated"
            :loading="processing"
            @click="approveRequest"
          >
            Confirmar Aprobación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-error">
          <v-icon class="mr-2">mdi-close-circle</v-icon>
          Rechazar Recarga
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="text-body-2">
              Usuario: <strong>{{ selectedRequest?.user_email }}</strong><br>
              Créditos: <strong>{{ selectedRequest?.credits_requested + selectedRequest?.bonus_credits }}</strong><br>
              Precio: <strong>{{ selectedRequest?.price }} BS</strong>
            </div>
          </v-alert>

          <v-textarea
            v-model="rejectNotes"
            label="Motivo del rechazo (requerido)"
            variant="outlined"
            rows="3"
            prepend-inner-icon="mdi-alert"
            :rules="[v => !!v || 'El motivo es requerido']"
            hint="Ej: Pago no verificado, monto incorrecto, etc."
            persistent-hint
            required
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="closeRejectDialog"
            :disabled="processing"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="elevated"
            :loading="processing"
            :disabled="!rejectNotes"
            @click="rejectRequest"
          >
            Confirmar Rechazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import dayjs from 'dayjs'

const toast = useToast()

// Estado
const loading = ref(false)
const processing = ref(false)
const search = ref('')
const pendingRequests = ref([])
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  totalAmount: 0
})

// Dialogs
const approveDialog = ref(false)
const rejectDialog = ref(false)
const selectedRequest = ref(null)
const approveNotes = ref('')
const rejectNotes = ref('')

// Table Headers
const headers = [
  { title: 'Usuario', key: 'user', sortable: true },
  { title: 'Créditos', key: 'credits', sortable: true },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'Vendedor', key: 'seller', sortable: true },
  { title: 'Fecha', key: 'created_at', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

// Métodos
const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const loadRequests = async () => {
  try {
    loading.value = true

    const response = await api.get('/credits/admin/pending-recharges')

    if (response.data.success) {
      pendingRequests.value = response.data.requests || []

      // Calcular estadísticas
      stats.value.pending = pendingRequests.value.length
      stats.value.totalAmount = pendingRequests.value.reduce((sum, req) => sum + req.price, 0)

      // Obtener stats del día (aprobadas/rechazadas)
      if (response.data.stats) {
        stats.value.approved = response.data.stats.approved_today || 0
        stats.value.rejected = response.data.stats.rejected_today || 0
      }
    }
  } catch (error) {
    console.error('Error loading recharge requests:', error)
    toast.error('Error al cargar solicitudes de recarga')
  } finally {
    loading.value = false
  }
}

const openApproveDialog = (request) => {
  selectedRequest.value = request
  approveNotes.value = 'Pago verificado'
  approveDialog.value = true
}

const closeApproveDialog = () => {
  approveDialog.value = false
  selectedRequest.value = null
  approveNotes.value = ''
}

const approveRequest = async () => {
  if (!selectedRequest.value) return

  try {
    processing.value = true

    const response = await api.post(`/credits/admin/process-recharge/${selectedRequest.value.id}`, {
      action: 'approve',
      notes: approveNotes.value
    })

    if (response.data.success) {
      toast.success('Recarga aprobada exitosamente')
      closeApproveDialog()
      await loadRequests()
    }
  } catch (error) {
    console.error('Error approving recharge:', error)
    const errorMessage = error.response?.data?.error || 'Error al aprobar recarga'
    toast.error(errorMessage)
  } finally {
    processing.value = false
  }
}

const openRejectDialog = (request) => {
  selectedRequest.value = request
  rejectNotes.value = ''
  rejectDialog.value = true
}

const closeRejectDialog = () => {
  rejectDialog.value = false
  selectedRequest.value = null
  rejectNotes.value = ''
}

const rejectRequest = async () => {
  if (!selectedRequest.value || !rejectNotes.value) {
    toast.warning('Debes indicar el motivo del rechazo')
    return
  }

  try {
    processing.value = true

    const response = await api.post(`/credits/admin/process-recharge/${selectedRequest.value.id}`, {
      action: 'reject',
      notes: rejectNotes.value
    })

    if (response.data.success) {
      toast.success('Recarga rechazada')
      closeRejectDialog()
      await loadRequests()
    }
  } catch (error) {
    console.error('Error rejecting recharge:', error)
    const errorMessage = error.response?.data?.error || 'Error al rechazar recarga'
    toast.error(errorMessage)
  } finally {
    processing.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadRequests()
})
</script>

<style scoped>
.admin-recharge-requests {
  max-width: 1600px;
}

.bg-success {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  color: white !important;
}

.bg-success :deep(*) {
  color: white !important;
}

.bg-error {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: white !important;
}

.bg-error :deep(*) {
  color: white !important;
}

/* Card animations */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Table improvements */
:deep(.v-table thead tr th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #374151 !important;
}

:deep(.v-table tbody tr:hover) {
  background: #f1f5f9 !important;
}

/* Badge inside v-alert should remain visible */
.bg-success :deep(.v-alert__content *),
.bg-error :deep(.v-alert__content *) {
  color: inherit !important;
}
</style>
