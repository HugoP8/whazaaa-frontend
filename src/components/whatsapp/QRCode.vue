<template>
  <v-card
    elevation="4"
    rounded="xl"
    class="qr-container"
  >
    <v-card-text class="text-center pa-8">
      <v-icon
        size="64"
        color="primary"
        class="mb-4"
      >
        mdi-whatsapp
      </v-icon>
      
      <h2 class="text-h5 mb-4">
        Conecta tu WhatsApp
      </h2>
      
      <div v-if="!qrCode && !isConnecting">
        <p class="text-body-1 mb-6">
          Haz clic en el botón para generar el código QR
        </p>
        
        <v-btn
          color="primary"
          size="large"
          @click="connect"
          :loading="isConnecting"
        >
          <v-icon start>mdi-qrcode</v-icon>
          Generar QR
        </v-btn>
      </div>
      
      <div v-else-if="qrCode">
        <p class="text-body-1 mb-4">
          Escanea este código QR con tu WhatsApp
        </p>
        
        <img
          :src="qrCode"
          alt="WhatsApp QR Code"
          class="qr-image"
        />
        
        <v-alert
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <ol class="text-left">
            <li>Abre WhatsApp en tu teléfono</li>
            <li>Ve a Configuración > Dispositivos vinculados</li>
            <li>Toca "Vincular dispositivo"</li>
            <li>Escanea este código QR</li>
          </ol>
        </v-alert>
      </div>
      
      <div v-else-if="isConnecting && !qrCode">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        ></v-progress-circular>
        
        <p class="text-body-1">
          Generando código QR...
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const qrCode = computed(() => store.getters['whatsapp/qrCode'])
const isConnecting = computed(() => store.getters['whatsapp/isConnecting'])

const connect = () => {
  store.dispatch('whatsapp/connect')
}
</script>

<style scoped>
.qr-container {
  max-width: 500px;
  margin: 0 auto;
}

.qr-image {
  max-width: 280px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>