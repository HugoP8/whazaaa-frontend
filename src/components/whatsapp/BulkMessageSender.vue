<template>
  <v-card elevation="2" rounded="xl">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-send-outline</v-icon>
      Envío Masivo Rápido
    </v-card-title>
    
    <v-card-text>
      <v-form v-model="valid" @submit.prevent="handleSendBulk">
        <!-- Mensaje -->
        <v-textarea
          v-model="message"
          label="Mensaje"
          rows="4"
          :rules="[rules.required, rules.messageContent]"
          counter
          maxlength="4000"
          hint="Escribe tu mensaje aquí"
          persistent-hint
          class="mb-4"
        ></v-textarea>
        
        <!-- Destinatarios -->
        <v-tabs
          v-model="recipientTab"
          color="primary"
          grow
          class="mb-4"
        >
          <v-tab value="contacts">
            <v-icon start>mdi-contacts</v-icon>
            Contactos
          </v-tab>
          <v-tab value="numbers">
            <v-icon start>mdi-phone</v-icon>
            Números
          </v-tab>
        </v-tabs>
        
        <v-window v-model="recipientTab">
          <!-- Contactos -->
          <v-window-item value="contacts">
            <v-text-field
              v-model="contactSearch"
              label="Buscar contactos"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              class="mb-3"
            ></v-text-field>
            
            <v-sheet max-height="300" class="overflow-y-auto">
              <v-list density="compact">
                <v-list-item
                  v-for="contact in filteredContacts"
                  :key="contact.id"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="selectedContacts"
                      :value="contact.phone"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </template>
                  
                  <v-list-item-title>{{ contact.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ contact.phone }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-window-item>
          
          <!-- Números manuales -->
          <v-window-item value="numbers">
            <v-textarea
              v-model="manualNumbers"
              label="Números de teléfono"
              placeholder="Ingresa un número por línea:&#10;+521234567890&#10;+525555555555"
              rows="8"
              hint="Incluye el código de país. Un número por línea."
              persistent-hint
            ></v-textarea>
          </v-window-item>
        </v-window>
        
        <!-- Configuraciones avanzadas -->
        <v-expansion-panels class="my-4" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-cog</v-icon>
              Configuración Avanzada
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="delay"
                    label="Retraso entre mensajes"
                    :items="delayOptions"
                    item-title="text"
                    item-value="value"
                    prepend-icon="mdi-timer"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="batchSize"
                    label="Tamaño de lote"
                    :items="batchSizeOptions"
                    item-title="text"
                    item-value="value"
                    prepend-icon="mdi-package-variant"
                  ></v-select>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        
        <!-- Resumen -->
        <v-alert
          v-if="totalRecipients > 0"
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <strong>{{ totalRecipients }}</strong> destinatarios seleccionados
          <br>
          <small>
            Tiempo estimado: ~{{ Math.ceil((totalRecipients * delay) / 60000) }} minutos
          </small>
        </v-alert>
        
        <!-- Progreso de envío -->
        <v-card
          v-if="sending"
          color="primary"
          variant="tonal"
          class="mb-4"
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <span>Enviando mensajes...</span>
              <span>{{ sentCount }}/{{ totalMessages }}</span>
            </div>
            <v-progress-linear
              :model-value="progress"
              color="primary"
              height="8"
              rounded
            ></v-progress-linear>
            
            <div class="mt-2 text-caption">
              <div class="d-flex justify-space-between">
                <span class="text-green">✓ Enviados: {{ sentCount }}</span>
                <span class="text-red">✗ Fallidos: {{ failedCount }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Botones -->
        <div class="d-flex justify-end gap-2">
          <v-btn
            variant="text"
            @click="clearAll"
            :disabled="sending"
          >
            Limpiar
          </v-btn>
          
          <v-btn
            type="submit"
            color="primary"
            :loading="sending"
            :disabled="!valid || totalRecipients === 0 || !isWhatsAppConnected"
          >
            <v-icon start>mdi-send</v-icon>
            Enviar {{ totalRecipients > 0 ? `(${totalRecipients})` : '' }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import * as validators from '@/utils/validators'

const store = useStore()
const toast = useToast()

// Estado reactivo
const valid = ref(false)
const sending = ref(false)
const message = ref('')
const recipientTab = ref('contacts')
const contactSearch = ref('')
const selectedContacts = ref([])
const manualNumbers = ref('')
const delay = ref(2000)
const batchSize = ref(10)

// Estado del progreso
const sentCount = ref(0)
const failedCount = ref(0)
const totalMessages = ref(0)

// Opciones
const delayOptions = [
  { text: '1 segundo', value: 1000 },
  { text: '2 segundos', value: 2000 },
  { text: '3 segundos', value: 3000 },
  { text: '5 segundos', value: 5000 },
  { text: '10 segundos', value: 10000 }
]

const batchSizeOptions = [
  { text: '5 mensajes', value: 5 },
  { text: '10 mensajes', value: 10 },
  { text: '20 mensajes', value: 20 },
  { text: '50 mensajes', value: 50 }
]

// Reglas de validación
const rules = {
  required: validators.required,
  messageContent: validators.messageContent
}

// Estados computados
const contacts = computed(() => store.getters['whatsapp/contacts'])
const isWhatsAppConnected = computed(() => store.getters['whatsapp/isConnected'])

const filteredContacts = computed(() => {
  if (!contactSearch.value) return contacts.value
  const search = contactSearch.value.toLowerCase()
  return contacts.value.filter(contact => 
    contact.name?.toLowerCase().includes(search) ||
    contact.phone?.includes(search)
  )
})

const totalRecipients = computed(() => {
  let total = selectedContacts.value.length
  
  if (manualNumbers.value) {
    const numbers = manualNumbers.value.split('\n').filter(n => n.trim())
    total += numbers.length
  }
  
  return total
})

const progress = computed(() => {
  if (totalMessages.value === 0) return 0
  return Math.round((sentCount.value / totalMessages.value) * 100)
})

// Métodos
const clearAll = () => {
  message.value = ''
  selectedContacts.value = []
  manualNumbers.value = ''
  sentCount.value = 0
  failedCount.value = 0
  totalMessages.value = 0
}

const handleSendBulk = async () => {
  if (!valid.value || !isWhatsAppConnected.value) return
  
  if (totalRecipients.value === 0) {
    toast.warning('Selecciona al menos un destinatario')
    return
  }
  
  sending.value = true
  sentCount.value = 0
  failedCount.value = 0
  totalMessages.value = totalRecipients.value
  
  try {
    // Preparar lista de destinatarios
    const recipients = [...selectedContacts.value]
    
    if (manualNumbers.value) {
      const numbers = manualNumbers.value
        .split('\n')
        .filter(n => n.trim())
        .map(n => {
          const cleaned = n.trim()
          return cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`
        })
      recipients.push(...numbers)
    }
    
    // Preparar mensajes
    const messages = recipients.map(recipient => ({
      to: recipient,
      message: message.value
    }))
    
    console.log('[BulkSender] Enviando', messages.length, 'mensajes')
    
    // Enviar mensajes masivos
    await store.dispatch('whatsapp/sendBulkMessages', {
      messages,
      options: {
        delay: delay.value,
        batchSize: batchSize.value
      }
    })
    
    toast.success(`¡Enviando ${messages.length} mensajes!`)
    
  } catch (error) {
    console.error('[BulkSender] Error:', error)
    toast.error(error.message || 'Error al enviar mensajes')
  } finally {
    sending.value = false
  }
}

// Watchers para eventos de socket
watch(() => store.state.whatsapp, (whatsappState) => {
  // Este watcher se activará cuando el estado de WhatsApp cambie
  // incluyendo eventos de mensajes enviados/fallidos
}, { deep: true })

// Configurar listeners para progreso en tiempo real
const setupProgressListeners = () => {
  // Estos eventos vendrán del socket cuando se implementen en el backend
  const socket = store.state.whatsapp.socket
  if (socket) {
    socket.on('bulk-message-sent', (data) => {
      sentCount.value++
    })
    
    socket.on('bulk-message-failed', (data) => {
      failedCount.value++
    })
    
    socket.on('bulk-campaign-completed', () => {
      sending.value = false
      const successRate = Math.round((sentCount.value / totalMessages.value) * 100)
      toast.success(`Campaña completada. ${successRate}% éxito`)
    })
  }
}

onMounted(async () => {
  // Cargar contactos si están conectados
  if (isWhatsAppConnected.value) {
    try {
      await store.dispatch('whatsapp/fetchContacts')
    } catch (error) {
      console.warn('No se pudieron cargar los contactos:', error)
    }
  }
  
  setupProgressListeners()
})

// Verificar conexión de WhatsApp
watch(isWhatsAppConnected, (connected) => {
  if (connected) {
    store.dispatch('whatsapp/fetchContacts').catch(console.warn)
    setupProgressListeners()
  }
})
</script>

<style scoped>
.text-green {
  color: #4caf50;
}

.text-red {
  color: #f44336;
}

.gap-2 {
  gap: 8px;
}
</style>