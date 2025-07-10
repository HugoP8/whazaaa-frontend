<template>
  <v-chip
    :color="statusColor"
    :prepend-icon="statusIcon"
    variant="flat"
    class="mx-2"
  >
    {{ statusText }}
  </v-chip>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isConnected = computed(() => store.getters['whatsapp/isConnected'])
const isConnecting = computed(() => store.getters['whatsapp/isConnecting'])

const statusColor = computed(() => {
  if (isConnecting.value) return 'warning'
  return isConnected.value ? 'success' : 'error'
})

const statusIcon = computed(() => {
  if (isConnecting.value) return 'mdi-loading mdi-spin'
  return isConnected.value ? 'mdi-check-circle' : 'mdi-alert-circle'
})

const statusText = computed(() => {
  if (isConnecting.value) return 'Conectando...'
  return isConnected.value ? 'Conectado' : 'Desconectado'
})

onMounted(() => {
  // Verificar estado al montar
  store.dispatch('whatsapp/checkStatus')
})
</script>