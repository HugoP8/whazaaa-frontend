<template>
  <div class="admin-dashboard">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">
          Dashboard Administrativo
        </h1>
        <p class="text-body-1 text-grey">
          Vista general del sistema
        </p>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" prominent border="start">
          <v-alert-title class="text-h6 mb-2">
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            Error al cargar datos del panel
          </v-alert-title>

          <div class="mb-3">{{ error }}</div>

          <v-divider class="my-3"></v-divider>

          <div class="text-body-2">
            <strong>Posibles causas:</strong>
            <ul class="mt-2">
              <li>El backend no está corriendo (puerto 3000)</li>
              <li>Los endpoints de admin no están implementados</li>
              <li>Token de autenticación expirado</li>
              <li>No tienes permisos de administrador</li>
            </ul>
          </div>

          <v-divider class="my-3"></v-divider>

          <div class="text-body-2">
            <strong>Soluciones:</strong>
            <ul class="mt-2">
              <li>Verificar que el backend esté corriendo: <code>npm start</code></li>
              <li>Revisar la consola del navegador (F12) para más detalles</li>
              <li>Consultar <code>APIS_NECESARIAS_BACKEND.md</code></li>
            </ul>
          </div>

          <div class="mt-4">
            <v-btn
              color="error"
              variant="elevated"
              prepend-icon="mdi-refresh"
              @click="loadDashboard"
              :loading="loading"
            >
              Reintentar
            </v-btn>

            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              class="ml-2"
              @click="$router.push('/dashboard')"
            >
              Volver al Dashboard
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Dashboard Content -->
    <template v-else-if="dashboard">
      <!-- Main Metrics -->
      <v-row class="mt-4">
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="primary" size="48" class="mb-3">
                mdi-account-multiple
              </v-icon>
              <div class="text-h4 font-weight-bold">
                {{ dashboard.users?.total_users || 0 }}
              </div>
              <div class="text-caption text-grey mt-1">
                Usuarios Totales
              </div>
              <v-chip
                size="small"
                color="success"
                class="mt-2"
              >
                +{{ dashboard.users?.new_users_month || 0 }} este mes
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="success" size="48" class="mb-3">
                mdi-currency-usd
              </v-icon>
              <div class="text-h4 font-weight-bold">
                ${{ dashboard.financial?.revenue_month || 0 }}
              </div>
              <div class="text-caption text-grey mt-1">
                Ingresos del Mes
              </div>
              <v-chip
                size="small"
                color="info"
                class="mt-2"
              >
                ${{ dashboard.financial?.revenue_total || 0 }} total
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="orange" size="48" class="mb-3">
                mdi-email-multiple
              </v-icon>
              <div class="text-h4 font-weight-bold">
                {{ dashboard.campaigns?.active_campaigns || 0 }}
              </div>
              <div class="text-caption text-grey mt-1">
                Campañas Activas
              </div>
              <v-chip
                size="small"
                color="orange"
                class="mt-2"
              >
                {{ dashboard.campaigns?.total_campaigns || 0 }} total
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" rounded="xl">
            <v-card-text class="text-center pa-6">
              <v-icon color="blue" size="48" class="mb-3">
                mdi-send
              </v-icon>
              <div class="text-h4 font-weight-bold">
                {{ formatNumber(dashboard.campaigns?.total_messages_sent) }}
              </div>
              <div class="text-caption text-grey mt-1">
                Mensajes Enviados
              </div>
              <v-chip
                size="small"
                color="error"
                class="mt-2"
              >
                {{ dashboard.campaigns?.total_messages_failed || 0 }} fallidos
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Subscriptions by Plan -->
      <v-row class="mt-4">
        <v-col cols="12" md="8">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 bg-primary">
              <v-icon class="mr-2">mdi-crown</v-icon>
              Suscripciones por Plan
            </v-card-title>

            <v-card-text class="pa-0">
              <v-table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th class="text-center">Suscriptores</th>
                    <th class="text-right">Precio</th>
                    <th class="text-right">Ingresos Proyectados</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sub in dashboard.subscriptions" :key="sub.plan_name">
                    <td>
                      <v-chip size="small" :color="getPlanColor(sub.plan_name)">
                        {{ sub.display_name }}
                      </v-chip>
                    </td>
                    <td class="text-center font-weight-bold">
                      {{ sub.active_subscriptions }}
                    </td>
                    <td class="text-right">${{ sub.price }}</td>
                    <td class="text-right font-weight-bold text-success">
                      ${{ (parseFloat(sub.price) * parseInt(sub.active_subscriptions)).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 bg-success">
              <v-icon class="mr-2">mdi-chart-pie</v-icon>
              Resumen Financiero
            </v-card-title>

            <v-card-text class="pa-6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Ingresos Totales</div>
                <div class="text-h5 font-weight-bold text-success">
                  ${{ dashboard.financial?.revenue_total || 0 }}
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Ingresos del Mes</div>
                <div class="text-h6 font-weight-bold">
                  ${{ dashboard.financial?.revenue_month || 0 }}
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <div>
                <div class="text-caption text-grey mb-1">Transacciones del Mes</div>
                <div class="text-h6 font-weight-bold">
                  {{ dashboard.financial?.transactions_month || 0 }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Revenue by Month -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 bg-info">
              <v-icon class="mr-2">mdi-chart-bar</v-icon>
              Ingresos por Mes (Últimos 6 meses)
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row v-if="dashboard.revenue_by_month && dashboard.revenue_by_month.length > 0">
                <v-col
                  v-for="month in dashboard.revenue_by_month"
                  :key="month.month"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="2"
                >
                  <v-card variant="tonal" color="blue-lighten-5" rounded="lg">
                    <v-card-text class="text-center pa-4">
                      <div class="text-caption text-grey mb-1">
                        {{ formatMonth(month.month) }}
                      </div>
                      <div class="text-h6 font-weight-bold text-primary">
                        ${{ month.revenue }}
                      </div>
                      <div class="text-caption text-grey mt-1">
                        {{ month.transactions }} transacciones
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else type="info" variant="tonal">
                No hay datos de ingresos disponibles
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6">
              <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
              Acciones Rápidas
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    block
                    size="large"
                    prepend-icon="mdi-account-multiple"
                    @click="$router.push('/admin/users')"
                  >
                    Ver Usuarios
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="success"
                    variant="elevated"
                    block
                    size="large"
                    prepend-icon="mdi-chart-line"
                    @click="$router.push('/admin/reports')"
                  >
                    Ver Reportes
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="orange"
                    variant="elevated"
                    block
                    size="large"
                    prepend-icon="mdi-package-variant"
                    @click="$router.push('/admin/plans')"
                  >
                    Gestionar Planes
                  </v-btn>
                </v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-btn
                    color="info"
                    variant="outlined"
                    block
                    size="large"
                    prepend-icon="mdi-refresh"
                    @click="loadDashboard"
                    :loading="loading"
                  >
                    Actualizar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// State
const loading = computed(() => store.getters['admin/loading'])
const error = computed(() => store.getters['admin/error'])
const dashboard = computed(() => store.getters['admin/dashboard'])

// Methods
const loadDashboard = async () => {
  try {
    await store.dispatch('admin/fetchDashboard')
  } catch (err) {
    console.error('Error loading dashboard:', err)
  }
}

const formatNumber = (num) => {
  if (!num) return '0'
  return parseInt(num).toLocaleString('es-ES')
}

const formatMonth = (monthStr) => {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
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

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1600px;
}

.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white !important;
}

.bg-primary :deep(*) {
  color: white !important;
}

.bg-success {
  background: linear-gradient(135deg, #43a047 0%, #388e3c 100%);
  color: white !important;
}

.bg-success :deep(*) {
  color: white !important;
}

.bg-info {
  background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
  color: white !important;
}

.bg-info :deep(*) {
  color: white !important;
}

:deep(.v-table thead tr th) {
  background: #f5f5f5 !important;
  font-weight: 600;
  color: #374151 !important;
}

:deep(.v-table tbody tr:hover) {
  background: #f1f5f9 !important;
}

/* Card hover effects */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}
</style>
