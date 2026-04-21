<template>
  <div class="payment-result-page">
    <v-row class="justify-center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="8" rounded="xl" class="text-center">
          <v-card-text class="pa-8">
            <!-- Cancel Icon -->
            <div class="cancel-icon-wrapper mb-6">
              <v-icon
                color="warning"
                size="120"
                class="cancel-icon"
              >
                mdi-alert-circle
              </v-icon>
            </div>

            <!-- Cancel Message -->
            <h1 class="text-h3 font-weight-bold mb-4 text-warning">
              Pago Cancelado
            </h1>

            <p class="text-h6 text-grey-darken-1 mb-6">
              No se realizó ningún cargo a tu cuenta
            </p>

            <!-- Details Card -->
            <v-card
              variant="tonal"
              color="orange"
              class="mb-6 text-left"
            >
              <v-card-text class="pa-4">
                <v-list class="bg-transparent" density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="orange">mdi-information-outline</v-icon>
                    </template>
                    <v-list-item-title>
                      El proceso de pago fue cancelado
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="orange">mdi-shield-check</v-icon>
                    </template>
                    <v-list-item-title>
                      Tu información está segura
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="orange">mdi-credit-card-off</v-icon>
                    </template>
                    <v-list-item-title>
                      No se realizó ningún cobro
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Info Alert -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6 text-left"
            >
              <div class="text-body-2">
                <strong>¿Tuviste algún problema?</strong><br>
                Si encontraste algún inconveniente durante el proceso de pago,
                no dudes en contactar a nuestro equipo de soporte. Estamos aquí para ayudarte.
              </div>
            </v-alert>

            <!-- Reasons List -->
            <v-card
              variant="outlined"
              class="mb-6 text-left"
            >
              <v-card-text class="pa-4">
                <div class="text-subtitle-2 font-weight-bold mb-3">
                  Razones comunes de cancelación:
                </div>
                <v-list class="bg-transparent" density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small" color="grey">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                      Cambio de opinión sobre el plan seleccionado
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small" color="grey">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                      Información de pago incorrecta
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon size="small" color="grey">mdi-circle-small</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                      Necesidad de revisar los términos
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Action Buttons -->
            <v-row class="justify-center">
              <v-col cols="12" sm="6">
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  block
                  prepend-icon="mdi-rocket-launch"
                  @click="$router.push('/pricing')"
                >
                  Ver Planes
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                  color="grey"
                  variant="outlined"
                  size="large"
                  block
                  prepend-icon="mdi-view-dashboard"
                  @click="$router.push('/dashboard')"
                >
                  Volver al Dashboard
                </v-btn>
              </v-col>
            </v-row>

            <!-- Additional Actions -->
            <div class="mt-6">
              <v-btn
                variant="text"
                size="small"
                color="grey"
                @click="$router.push('/settings')"
              >
                <v-icon left>mdi-help-circle</v-icon>
                Contactar Soporte
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Payment cancelled page loaded')
})
</script>

<style scoped>
.payment-result-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 24px;
}

.cancel-icon-wrapper {
  position: relative;
  display: inline-block;
}

.cancel-icon {
  animation: shake 0.6s ease-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}
</style>
