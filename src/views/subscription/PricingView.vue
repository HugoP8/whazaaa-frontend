<template>
  <div class="pricing-page">
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-2">
          Elige el Plan Perfecto para Ti
        </h1>
        <p class="text-h6 text-grey mb-8">
          Selecciona el plan que mejor se adapte a tus necesidades
        </p>
      </v-col>
    </v-row>

    <!-- Selector de período de facturación -->
    <v-row class="justify-center mb-6">
      <v-col cols="12" md="4">
        <v-btn-toggle
          v-model="billingPeriod"
          color="primary"
          mandatory
          divided
          class="w-100"
        >
          <v-btn value="monthly" class="flex-grow-1">
            <v-icon left>mdi-calendar-month</v-icon>
            Mensual
          </v-btn>
          <v-btn value="yearly" class="flex-grow-1">
            <v-icon left>mdi-calendar</v-icon>
            Anual
            <v-chip size="x-small" color="success" class="ml-2">-20%</v-chip>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading" class="justify-center">
      <v-col cols="12" md="10">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-col>
    </v-row>

    <!-- Plans Grid -->
    <v-row v-else class="justify-center">
      <v-col
        v-for="plan in plans"
        :key="plan.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          elevation="8"
          rounded="xl"
          class="plan-card"
          :class="{
            'current-plan': currentPlanName === plan.name,
            'featured-plan': plan.name === 'pro'
          }"
        >
          <v-chip
            v-if="currentPlanName === plan.name"
            color="success"
            size="small"
            class="plan-badge"
          >
            Plan Actual
          </v-chip>

          <v-chip
            v-if="plan.name === 'pro'"
            color="primary"
            size="small"
            class="plan-badge"
          >
            Más Popular
          </v-chip>

          <v-card-text class="text-center pa-6">
            <!-- Plan Icon -->
            <v-icon
              :color="getPlanColor(plan.name)"
              size="64"
              class="mb-4"
            >
              {{ getPlanIcon(plan.name) }}
            </v-icon>

            <!-- Plan Name -->
            <h2 class="text-h4 font-weight-bold mb-2">
              {{ plan.display_name }}
            </h2>

            <!-- Plan Description -->
            <p class="text-body-2 text-grey mb-4">
              {{ plan.description }}
            </p>

            <!-- Price -->
            <div class="mb-4">
              <span class="text-h3 font-weight-bold" :class="`text-${getPlanColor(plan.name)}`">
                ${{ getPlanPrice(plan) }}
              </span>
              <span class="text-body-1 text-grey">
                /{{ billingPeriod === 'monthly' ? 'mes' : 'año' }}
              </span>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Features List -->
            <v-list class="bg-transparent" density="compact">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ plan.daily_message_limit }} mensajes/día
                </v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ plan.monthly_message_limit }} mensajes/mes
                </v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ plan.max_campaigns || 'Campañas ilimitadas' }}
                  {{ plan.max_campaigns ? ' campañas' : '' }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ plan.max_whatsapp_accounts }} cuenta(s) WhatsApp
                </v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ plan.max_contacts || 'Contactos ilimitados' }}
                  {{ plan.max_contacts ? ' contactos' : '' }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="plan.has_advanced_reports" class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Reportes avanzados
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="plan.has_api_access" class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Acceso a API
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="plan.has_priority_support" class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Soporte prioritario
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="plan.has_ai_responses" class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Respuestas con IA
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="!plan.show_ads" class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Sin publicidad
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- Action Button -->
            <v-btn
              :color="getPlanColor(plan.name)"
              block
              size="large"
              rounded="lg"
              elevation="2"
              class="mt-6 font-weight-bold"
              :disabled="currentPlanName === plan.name || selectingPlan === plan.id"
              :loading="selectingPlan === plan.id"
              @click="selectPlan(plan)"
            >
              {{
                currentPlanName === plan.name
                  ? 'Plan Actual'
                  : plan.price === '0.00'
                  ? 'Comenzar Gratis'
                  : 'Seleccionar Plan'
              }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- FAQ or Additional Info -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" color="blue-lighten-5">
          <v-card-text class="text-center py-6">
            <v-icon color="info" size="48" class="mb-4">mdi-information</v-icon>
            <h3 class="text-h5 mb-2">¿Necesitas ayuda para elegir?</h3>
            <p class="text-body-1 mb-4">
              Todos los planes incluyen 30 días de garantía de devolución de dinero
            </p>
            <v-btn
              color="info"
              variant="outlined"
              @click="$router.push('/settings')"
            >
              Contactar con Soporte
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { subscriptionService } from '@/services/subscriptionService'

const router = useRouter()
const toast = useToast()

// Estado
const loading = ref(false)
const plans = ref([])
const currentPlanName = ref(null)
const selectingPlan = ref(null)
const billingPeriod = ref('monthly')

// Métodos
const getPlanColor = (planName) => {
  const colors = {
    free: 'grey-darken-1',
    pro: 'primary',
    premium: 'purple',
    enterprise: 'orange'
  }
  return colors[planName] || 'primary'
}

const getPlanIcon = (planName) => {
  const icons = {
    free: 'mdi-star-outline',
    pro: 'mdi-rocket-launch',
    premium: 'mdi-crown',
    enterprise: 'mdi-office-building'
  }
  return icons[planName] || 'mdi-package'
}

const getPlanPrice = (plan) => {
  if (plan.price === '0.00') return '0'

  const price = parseFloat(plan.price)

  if (billingPeriod.value === 'yearly') {
    // Descuento del 20% para planes anuales
    const yearlyPrice = price * 12 * 0.8
    return yearlyPrice.toFixed(2)
  }

  return price.toFixed(2)
}

const loadPlans = async () => {
  try {
    loading.value = true
    const response = await subscriptionService.getPublicPlans()

    if (response.success) {
      plans.value = response.plans || []
    }
  } catch (error) {
    console.error('Error loading plans:', error)
    toast.error('Error al cargar los planes')
  } finally {
    loading.value = false
  }
}

const loadCurrentSubscription = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await subscriptionService.getMySubscription()

    if (response.success && response.subscription) {
      currentPlanName.value = response.subscription.plan?.name
    }
  } catch (error) {
    console.error('Error loading subscription:', error)
    // No mostrar error si no hay token
    if (error.response?.status !== 401) {
      toast.error('Error al cargar tu suscripción actual')
    }
  }
}

const selectPlan = async (plan) => {
  const token = localStorage.getItem('token')

  if (!token) {
    toast.warning('Debes iniciar sesión para seleccionar un plan')
    router.push('/auth/login')
    return
  }

  if (currentPlanName.value === plan.name) {
    toast.info('Ya tienes este plan activo')
    return
  }

  // Si es plan gratuito, redirigir a la página de suscripción
  if (plan.price === '0.00') {
    toast.info('El plan gratuito ya está disponible para ti')
    return
  }

  try {
    selectingPlan.value = plan.id

    const response = await subscriptionService.createCheckoutSession(
      plan.id,
      billingPeriod.value
    )

    if (response.success && response.url) {
      // Redirigir a Stripe Checkout
      window.location.href = response.url
    } else {
      toast.error('Error al procesar el pago')
    }
  } catch (error) {
    console.error('Error selecting plan:', error)
    toast.error(error.response?.data?.message || 'Error al procesar el pago')
  } finally {
    selectingPlan.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadPlans(),
    loadCurrentSubscription()
  ])
})
</script>

<style scoped>
.pricing-page {
  padding: 24px;
}

.plan-card {
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  height: 100%;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(37, 211, 102, 0.2) !important;
  border-color: rgba(37, 211, 102, 0.3);
}

.featured-plan {
  border-color: rgba(25, 118, 210, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
}

.featured-plan:hover {
  border-color: rgba(25, 118, 210, 0.8);
  box-shadow: 0 12px 32px rgba(25, 118, 210, 0.3) !important;
}

.current-plan {
  border-color: rgba(76, 175, 80, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%);
}

.plan-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.v-list-item {
  min-height: 36px !important;
}

@media (max-width: 768px) {
  .plan-card:hover {
    transform: none;
  }
}
</style>
