<template>
  <div class="pricing-page">
    <!-- Header -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-2">
          Elige el Plan Perfecto para Ti
        </h1>
        <p class="text-h6 text-grey mb-2">
          Sistema de créditos simple y transparente
        </p>
        <p class="text-body-1 text-grey-darken-1 mb-8">
          1 crédito = 1 mensaje enviado · Paga solo por lo que usas
        </p>
      </v-col>
    </v-row>

    <!-- Info de pagos manuales -->
    <v-row class="justify-center mb-6">
      <v-col cols="12" md="8">
        <v-alert type="info" variant="tonal" class="text-center">
          <div class="text-body-1">
            <v-icon class="mr-2">mdi-information</v-icon>
            <strong>Pagos Manuales:</strong> Todos los planes se activan contactando a tu vendedor de confianza.
            No procesamos pagos automáticos.
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Plans Grid -->
    <v-row class="justify-center">
      <!-- FREE PLAN -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="8"
          rounded="xl"
          class="plan-card h-100"
          :class="{ 'current-plan': currentPlan === 'free' }"
        >
          <v-chip
            v-if="currentPlan === 'free'"
            color="success"
            size="small"
            class="plan-badge"
          >
            Plan Actual
          </v-chip>

          <v-card-text class="text-center pa-6 d-flex flex-column">
            <v-icon color="grey-darken-1" size="64" class="mb-4">
              mdi-gift
            </v-icon>

            <h2 class="text-h4 font-weight-bold mb-2">Gratuito</h2>
            <p class="text-body-2 text-grey mb-4">Perfecto para probar la plataforma</p>

            <div class="mb-4">
              <div class="text-h3 font-weight-bold text-grey-darken-1">GRATIS</div>
              <div class="text-caption text-grey">Una sola vez</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Credits Badge -->
            <v-card variant="tonal" color="grey-darken-1" rounded="lg" class="mb-4">
              <v-card-text class="pa-3">
                <div class="text-h4 font-weight-bold">3</div>
                <div class="text-caption">créditos de prueba</div>
              </v-card-text>
            </v-card>

            <v-list class="bg-transparent flex-grow-1" density="compact">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">3 mensajes incluidos</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">1 cuenta WhatsApp</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Reportes básicos</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="grey" size="small">mdi-close-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey">Sin soporte prioritario</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn
              color="grey-darken-1"
              block
              size="large"
              rounded="lg"
              elevation="2"
              class="mt-4 font-weight-bold"
              :disabled="currentPlan === 'free'"
            >
              {{ currentPlan === 'free' ? 'Plan Actual' : 'Comenzar Gratis' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- PRO PLAN -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="12"
          rounded="xl"
          class="plan-card featured-plan h-100"
          :class="{ 'current-plan': currentPlan === 'pro' }"
        >
          <v-chip
            v-if="currentPlan === 'pro'"
            color="success"
            size="small"
            class="plan-badge"
          >
            Plan Actual
          </v-chip>
          <v-chip
            v-else
            color="primary"
            size="small"
            class="plan-badge"
          >
            Más Popular
          </v-chip>

          <v-card-text class="text-center pa-6 d-flex flex-column">
            <v-icon color="primary" size="64" class="mb-4">
              mdi-account-star
            </v-icon>

            <h2 class="text-h4 font-weight-bold mb-2">Pro</h2>
            <p class="text-body-2 text-grey mb-4">Ideal para negocios pequeños</p>

            <div class="mb-4">
              <div class="text-h3 font-weight-bold text-primary">290 BS</div>
              <div class="text-caption text-grey">por mes</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Credits Badge -->
            <v-card variant="tonal" color="primary" rounded="lg" class="mb-4">
              <v-card-text class="pa-3">
                <div class="text-h4 font-weight-bold">30</div>
                <div class="text-caption">créditos mensuales</div>
                <div class="text-caption text-success font-weight-bold mt-1">~9.67 BS/crédito</div>
              </v-card-text>
            </v-card>

            <v-list class="bg-transparent flex-grow-1" density="compact">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">30 mensajes/mes incluidos</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Recarga con 20% descuento</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">2 cuentas WhatsApp</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Reportes avanzados</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Soporte estándar</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn
              color="primary"
              block
              size="large"
              rounded="lg"
              elevation="2"
              class="mt-4 font-weight-bold"
              :disabled="currentPlan === 'pro'"
              @click="openContactVendorDialog('pro')"
            >
              {{ currentPlan === 'pro' ? 'Plan Actual' : 'Seleccionar Pro' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- BUSINESS PLAN -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="8"
          rounded="xl"
          class="plan-card h-100"
          :class="{ 'current-plan': currentPlan === 'business' }"
        >
          <v-chip
            v-if="currentPlan === 'business'"
            color="success"
            size="small"
            class="plan-badge"
          >
            Plan Actual
          </v-chip>

          <v-card-text class="text-center pa-6 d-flex flex-column">
            <v-icon color="purple" size="64" class="mb-4">
              mdi-domain
            </v-icon>

            <h2 class="text-h4 font-weight-bold mb-2">Business</h2>
            <p class="text-body-2 text-grey mb-4">Para empresas en crecimiento</p>

            <div class="mb-4">
              <div class="text-h3 font-weight-bold text-purple">680 BS</div>
              <div class="text-caption text-grey">por mes</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Credits Badge -->
            <v-card variant="tonal" color="purple" rounded="lg" class="mb-4">
              <v-card-text class="pa-3">
                <div class="text-h4 font-weight-bold">100</div>
                <div class="text-caption">créditos mensuales</div>
                <div class="text-caption text-success font-weight-bold mt-1">~6.80 BS/crédito</div>
              </v-card-text>
            </v-card>

            <v-list class="bg-transparent flex-grow-1" density="compact">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">100 mensajes/mes incluidos</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Recarga con 30% descuento</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">5 cuentas WhatsApp</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Reportes completos + API</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Soporte prioritario</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Respuestas con IA</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn
              color="purple"
              block
              size="large"
              rounded="lg"
              elevation="2"
              class="mt-4 font-weight-bold"
              :disabled="currentPlan === 'business'"
              @click="openContactVendorDialog('business')"
            >
              {{ currentPlan === 'business' ? 'Plan Actual' : 'Seleccionar Business' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- FLEX PLAN -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="8"
          rounded="xl"
          class="plan-card h-100"
          :class="{ 'current-plan': currentPlan === 'flex' }"
        >
          <v-chip
            v-if="currentPlan === 'flex'"
            color="success"
            size="small"
            class="plan-badge"
          >
            Plan Actual
          </v-chip>
          <v-chip
            v-else
            color="orange"
            size="small"
            class="plan-badge"
          >
            Prepago
          </v-chip>

          <v-card-text class="text-center pa-6 d-flex flex-column">
            <v-icon color="orange" size="64" class="mb-4">
              mdi-lightning-bolt
            </v-icon>

            <h2 class="text-h4 font-weight-bold mb-2">Flex</h2>
            <p class="text-body-2 text-grey mb-4">Recarga cuando lo necesites</p>

            <div class="mb-4">
              <div class="text-h3 font-weight-bold text-orange">Variable</div>
              <div class="text-caption text-grey">Solo pagas lo que usas</div>
            </div>

            <v-divider class="my-4"></v-divider>

            <!-- Credits Badge -->
            <v-card variant="tonal" color="orange" rounded="lg" class="mb-4">
              <v-card-text class="pa-3">
                <div class="text-h4 font-weight-bold">Desde 10</div>
                <div class="text-caption">créditos por recarga</div>
                <div class="text-caption text-grey mt-1">10 BS/crédito</div>
              </v-card-text>
            </v-card>

            <v-list class="bg-transparent flex-grow-1" density="compact">
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Sin suscripción mensual</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Créditos no expiran</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Descuentos por volumen</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">1 cuenta WhatsApp</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="success" size="small">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2">Reportes básicos</v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-icon color="orange" size="small">mdi-alert-circle</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-orange">Ahorra 40% con Pro</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-btn
              color="orange"
              block
              size="large"
              rounded="lg"
              elevation="2"
              class="mt-4 font-weight-bold"
              :disabled="currentPlan === 'flex'"
              @click="openContactVendorDialog('flex')"
            >
              {{ currentPlan === 'flex' ? 'Plan Actual' : 'Seleccionar Flex' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Comparación de descuentos -->
    <v-row class="mt-8 justify-center">
      <v-col cols="12" md="10">
        <v-card elevation="2" rounded="xl" color="blue-lighten-5">
          <v-card-text class="pa-6">
            <h3 class="text-h5 mb-4 text-center">
              <v-icon class="mr-2">mdi-tag-multiple</v-icon>
              Ahorra más con planes de suscripción
            </h3>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="primary" rounded="lg">
                  <v-card-text class="text-center pa-4">
                    <div class="text-h6 font-weight-bold mb-2">Plan Pro</div>
                    <div class="text-h4 text-primary font-weight-bold">20%</div>
                    <div class="text-caption">descuento en recargas</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="purple" rounded="lg">
                  <v-card-text class="text-center pa-4">
                    <div class="text-h6 font-weight-bold mb-2">Plan Business</div>
                    <div class="text-h4 text-purple font-weight-bold">30%</div>
                    <div class="text-caption">descuento en recargas</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card variant="tonal" color="success" rounded="lg">
                  <v-card-text class="text-center pa-4">
                    <div class="text-h6 font-weight-bold mb-2">Bonus Extra</div>
                    <div class="text-h4 text-success font-weight-bold">+25</div>
                    <div class="text-caption">créditos en paquete 100</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- FAQ -->
    <v-row class="mt-6 justify-center">
      <v-col cols="12" md="10">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="pa-6">
            <h3 class="text-h5 mb-4 text-center">
              <v-icon class="mr-2">mdi-frequently-asked-questions</v-icon>
              Preguntas Frecuentes
            </h3>

            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  ¿Cómo funciona el sistema de créditos?
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  Cada mensaje enviado consume 1 crédito. Los créditos de tu plan mensual se renuevan automáticamente,
                  y los créditos bonus o de recarga permanecen en tu cuenta hasta que los uses.
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  ¿Cómo activo mi plan?
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  Todos los planes se activan contactando a tu vendedor de confianza. Simplemente selecciona el plan,
                  contacta al vendedor, menciona tu ID de usuario, y él procesará la activación manualmente.
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  ¿Puedo cambiar de plan?
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  Sí, puedes cambiar de plan en cualquier momento. Contacta a tu vendedor para procesar el cambio.
                  Los créditos restantes de tu plan anterior se mantendrán en tu cuenta.
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  ¿Los créditos expiran?
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  Los créditos de tu plan mensual (Pro/Business) se renuevan cada mes. Los créditos bonus y de recarga
                  no expiran nunca. En el plan Flex, todos los créditos son permanentes.
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>
                  ¿Qué pasa si me quedo sin créditos?
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  Recibirás notificaciones cuando estés bajo en créditos. Puedes recargar en cualquier momento
                  contactando a tu vendedor. Los usuarios con plan Pro/Business obtienen descuentos en las recargas.
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Contact Vendor Dialog -->
    <v-dialog v-model="showContactDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-gradient-primary">
          <v-icon class="mr-2">mdi-account-tie</v-icon>
          Contactar Vendedor
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              Para activar el plan <strong>{{ selectedPlanName }}</strong>, contacta a tu vendedor de confianza
              con la siguiente información.
            </div>
          </v-alert>

          <v-card variant="outlined" class="mb-4">
            <v-card-text class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3">Tu información:</div>
              <div class="text-body-2 mb-2">
                <strong>ID de Usuario:</strong> #{{ userId }}
              </div>
              <div class="text-body-2 mb-2">
                <strong>Email:</strong> {{ userEmail }}
              </div>
              <div class="text-body-2">
                <strong>Plan solicitado:</strong> {{ selectedPlanName }}
              </div>
            </v-card-text>
          </v-card>

          <v-card variant="outlined">
            <v-card-text class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon class="mr-2">mdi-account-tie</v-icon>
                Información del Vendedor
              </div>

              <v-list density="compact" class="bg-transparent">
                <v-list-item
                  prepend-icon="mdi-whatsapp"
                  :href="`https://wa.me/${vendorInfo.whatsapp}?text=${getWhatsAppMessage()}`"
                  target="_blank"
                >
                  <v-list-item-title>WhatsApp: {{ vendorInfo.whatsapp }}</v-list-item-title>
                </v-list-item>

                <v-list-item
                  prepend-icon="mdi-email"
                  :href="`mailto:${vendorInfo.email}`"
                >
                  <v-list-item-title>Email: {{ vendorInfo.email }}</v-list-item-title>
                </v-list-item>

                <v-list-item
                  v-if="vendorInfo.phone"
                  prepend-icon="mdi-phone"
                  :href="`tel:${vendorInfo.phone}`"
                >
                  <v-list-item-title>Teléfono: {{ vendorInfo.phone }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="showContactDialog = false"
          >
            Cerrar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="elevated"
            prepend-icon="mdi-whatsapp"
            :href="`https://wa.me/${vendorInfo.whatsapp}?text=${getWhatsAppMessage()}`"
            target="_blank"
            @click="showContactDialog = false"
          >
            Contactar por WhatsApp
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// Estado
const showContactDialog = ref(false)
const selectedPlanName = ref('')

// Computed
const currentPlan = computed(() => store.getters['credits/currentPlan'] || 'free')
const userId = computed(() => store.getters['auth/user']?.id || 0)
const userEmail = computed(() => store.getters['auth/user']?.email || '')

const vendorInfo = ref({
  whatsapp: import.meta.env.VITE_SALES_WA || '5491112345678',
  email: import.meta.env.VITE_SALES_EMAIL || 'ventas@whazaaa.com',
  phone: import.meta.env.VITE_VENDOR_PHONE || ''
})

// Methods
const openContactVendorDialog = (planName) => {
  const planNames = {
    pro: 'Pro',
    business: 'Business',
    flex: 'Flex'
  }
  selectedPlanName.value = planNames[planName] || planName
  showContactDialog.value = true
}

const getWhatsAppMessage = () => {
  const message = `Hola! Soy el usuario #${userId.value} de Whazaaa.

Email: ${userEmail.value}

Quiero activar el plan: ${selectedPlanName.value}

¿Cómo puedo proceder?`

  return encodeURIComponent(message)
}
</script>

<style scoped>
.pricing-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.plan-card {
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
}

.featured-plan {
  border-color: rgba(25, 118, 210, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
  transform: scale(1.02);
}

.featured-plan:hover {
  border-color: rgba(25, 118, 210, 0.8);
  box-shadow: 0 16px 40px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.02) translateY(-8px);
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

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.v-list-item {
  min-height: 36px !important;
}

@media (max-width: 1024px) {
  .featured-plan {
    transform: scale(1);
  }

  .featured-plan:hover {
    transform: translateY(-8px);
  }
}

@media (max-width: 768px) {
  .plan-card:hover {
    transform: none;
  }

  .featured-plan:hover {
    transform: none;
  }
}
</style>
