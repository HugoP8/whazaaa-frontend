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
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 bg-success">
              <v-icon class="mr-2">mdi-crown</v-icon>
              Suscripción Actual
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Plan</div>
                    <v-chip :color="getPlanColor(user.subscription?.plan_name)" size="large">
                      {{ user.subscription?.plan_display_name || 'Sin plan' }}
                    </v-chip>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-4">
                    <div class="text-caption text-grey mb-1">Estado</div>
                    <v-chip :color="getStatusColor(user.subscription?.status)" size="small">
                      {{ user.subscription?.status || 'Sin suscripción' }}
                    </v-chip>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption text-grey mb-1">Inicio</div>
                  <div class="text-body-2">{{ formatDate(user.subscription?.started_at) }}</div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption text-grey mb-1">Vencimiento</div>
                  <div class="text-body-2">{{ formatDate(user.subscription?.expires_at) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
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
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'

const store = useStore()
const route = useRoute()

const loading = computed(() => store.getters['admin/loading'])
const user = computed(() => store.getters['admin/selectedUser'])

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

onMounted(() => {
  store.dispatch('admin/fetchUserDetails', route.params.id)
})
</script>

<style scoped>
.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.bg-success {
  background: linear-gradient(135deg, #43a047 0%, #388e3c 100%);
  color: white;
}
</style>
