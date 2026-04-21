<template>
  <div class="payment-result-page">
    <v-row class="justify-center">
      <v-col cols="12" md="8" lg="6">
        <v-card elevation="8" rounded="xl" class="text-center">
          <v-card-text class="pa-8">
            <!-- Success Icon -->
            <div class="success-icon-wrapper mb-6">
              <v-icon
                color="success"
                size="120"
                class="success-icon"
              >
                mdi-check-circle
              </v-icon>
            </div>

            <!-- Success Message -->
            <h1 class="text-h3 font-weight-bold mb-4 text-success">
              ¡Pago Exitoso!
            </h1>

            <p class="text-h6 text-grey-darken-1 mb-6">
              Tu suscripción ha sido actualizada correctamente
            </p>

            <!-- Details Card -->
            <v-card
              variant="tonal"
              color="success"
              class="mb-6 text-left"
            >
              <v-card-text class="pa-4">
                <v-list class="bg-transparent" density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-check-circle-outline</v-icon>
                    </template>
                    <v-list-item-title>
                      Pago procesado correctamente
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-email-outline</v-icon>
                    </template>
                    <v-list-item-title>
                      Recibirás un correo de confirmación
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-shield-check</v-icon>
                    </template>
                    <v-list-item-title>
                      Tu plan está activo inmediatamente
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Info -->
            <v-alert
              type="info"
              variant="tonal"
              class="mb-6 text-left"
            >
              <div class="text-body-2">
                <strong>¿Qué sigue?</strong><br>
                Ahora puedes disfrutar de todas las características de tu nuevo plan.
                Visita tu panel de suscripción para ver tus nuevos límites y funcionalidades.
              </div>
            </v-alert>

            <!-- Action Buttons -->
            <v-row class="justify-center">
              <v-col cols="12" sm="6">
                <v-btn
                  color="success"
                  variant="elevated"
                  size="large"
                  block
                  prepend-icon="mdi-view-dashboard"
                  @click="$router.push('/dashboard')"
                >
                  Ir al Dashboard
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="large"
                  block
                  prepend-icon="mdi-card-account-details"
                  @click="$router.push('/subscription')"
                >
                  Ver Mi Suscripción
                </v-btn>
              </v-col>
            </v-row>

            <!-- Additional Actions -->
            <div class="mt-6">
              <v-btn
                variant="text"
                size="small"
                color="grey"
                @click="$router.push('/campaigns/new')"
              >
                <v-icon left>mdi-send</v-icon>
                Crear una Campaña
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

// Animación de confetti o celebración (opcional)
onMounted(() => {
  console.log('Payment success page loaded')
  // Aquí podrías agregar efectos de confetti con una librería como canvas-confetti
})
</script>

<style scoped>
.payment-result-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 24px;
}

.success-icon-wrapper {
  position: relative;
  display: inline-block;
}

.success-icon {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
