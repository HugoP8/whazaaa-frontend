<template>
  <div class="admin-plans">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Gestión de Planes</h1>
            <p class="text-body-1 text-grey">Crear y editar planes de suscripción</p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
            Nuevo Plan
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading" class="mt-4">
      <v-col cols="12">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Plans Grid -->
    <v-row v-else class="mt-4">
      <v-col v-for="plan in plans" :key="plan.id" cols="12" md="4">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            {{ plan.display_name }}
            <v-chip size="small" class="ml-2" :color="getPlanColor(plan.name)">
              {{ plan.name }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-6">
            <div class="text-h4 font-weight-bold mb-2">
              ${{ plan.price }}<span class="text-body-2">/{{ plan.billing_period }}</span>
            </div>

            <v-divider class="my-4"></v-divider>

            <div class="text-body-2">
              <div class="mb-2">📧 {{ plan.daily_message_limit }} mensajes/día</div>
              <div class="mb-2">📅 {{ plan.monthly_message_limit }} mensajes/mes</div>
              <div class="mb-2">🎯 {{ plan.max_campaigns || 'Ilimitadas' }} campañas</div>
              <div class="mb-2">📱 {{ plan.max_whatsapp_accounts }} cuenta(s) WhatsApp</div>
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn color="primary" variant="outlined" size="small" @click="editPlan(plan)">
              Editar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="800" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-primary">
          {{ editingPlan ? 'Editar Plan' : 'Crear Plan' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            Funcionalidad de edición pendiente de implementación completa
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const showCreateDialog = ref(false)
const editingPlan = ref(null)

const loading = computed(() => store.getters['admin/loading'])
const plans = computed(() => store.getters['admin/plans'])

const getPlanColor = (planName) => {
  const colors = { free: 'grey', pro: 'primary', premium: 'purple', enterprise: 'orange' }
  return colors[planName] || 'grey'
}

const editPlan = (plan) => {
  editingPlan.value = plan
  showCreateDialog.value = true
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingPlan.value = null
}

onMounted(() => {
  store.dispatch('admin/fetchPlans')
})
</script>

<style scoped>
.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}
</style>
