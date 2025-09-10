<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">
              Mensajes Masivos
            </h1>
            <p class="text-grey mt-1">
              Envía mensajes a múltiples contactos de forma rápida y eficiente
            </p>
          </div>
          
          <!-- Estado de conexión -->
          <v-chip
            :color="isConnected ? 'success' : 'error'"
            :prepend-icon="isConnected ? 'mdi-check-circle' : 'mdi-alert-circle'"
            variant="tonal"
            size="large"
          >
            {{ isConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado' }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
    
    <!-- Alerta si no está conectado -->
    <v-row v-if="!isConnected">
      <v-col cols="12">
        <v-alert
          type="warning"
          variant="tonal"
          prominent
          border="start"
          class="mb-6"
        >
          <v-alert-title>
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            WhatsApp No Conectado
          </v-alert-title>
          <p class="mb-3">
            Necesitas conectar WhatsApp primero para poder enviar mensajes masivos.
          </p>
          <v-btn
            color="primary"
            @click="$router.push('/dashboard')"
          >
            <v-icon start>mdi-qrcode</v-icon>
            Conectar WhatsApp
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>
    
    <!-- Componente de envío masivo -->
    <v-row>
      <v-col cols="12" lg="8">
        <bulk-message-sender />
      </v-col>
      
      <!-- Panel lateral con información -->
      <v-col cols="12" lg="4">
        <v-card elevation="2" rounded="xl" class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Información
          </v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="d-flex justify-space-between">
                <span>Contactos disponibles:</span>
                <strong>{{ contacts.length }}</strong>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-space-between">
                <span>Grupos disponibles:</span>
                <strong>{{ groups.length }}</strong>
              </div>
            </div>
            
            <v-divider class="my-3"></v-divider>
            
            <div class="text-caption text-grey">
              <p class="mb-2">
                <v-icon size="small" class="mr-1">mdi-lightbulb</v-icon>
                <strong>Consejos:</strong>
              </p>
              <ul class="pl-4">
                <li>Usa retrasos entre mensajes para evitar ser bloqueado</li>
                <li>Personaliza tus mensajes para mejor engagement</li>
                <li>Revisa siempre la lista antes de enviar</li>
                <li>Los números deben incluir código de país</li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Estadísticas rápidas -->
        <v-card elevation="2" rounded="xl" v-if="isConnected">
          <v-card-title>
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Estadísticas Rápidas
          </v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Mensajes hoy</span>
                <v-chip color="primary" size="small">0</v-chip>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Mensajes esta semana</span>
                <v-chip color="success" size="small">0</v-chip>
              </div>
            </div>
            
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">Total mensajes</span>
                <v-chip color="info" size="small">0</v-chip>
              </div>
            </div>
            
            <v-btn
              variant="text"
              size="small"
              color="primary"
              @click="$router.push('/campaigns')"
              block
              class="mt-3"
            >
              Ver Campañas Completas
            </v-btn>
          </v-card-text>
        </v-card>
        
        <!-- Acciones rápidas -->
        <v-card elevation="2" rounded="xl" class="mt-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                @click="$router.push('/campaigns/new')"
                :disabled="!isConnected"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-plus</v-icon>
                </template>
                <v-list-item-title>Nueva Campaña</v-list-item-title>
                <v-list-item-subtitle>Crear campaña avanzada</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item
                @click="$router.push('/contacts')"
                :disabled="!isConnected"
              >
                <template v-slot:prepend>
                  <v-icon>mdi-contacts</v-icon>
                </template>
                <v-list-item-title>Gestionar Contactos</v-list-item-title>
                <v-list-item-subtitle>Organizar destinatarios</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item @click="refreshData" :disabled="!isConnected">
                <template v-slot:prepend>
                  <v-icon>mdi-refresh</v-icon>
                </template>
                <v-list-item-title>Actualizar Datos</v-list-item-title>
                <v-list-item-subtitle>Sincronizar contactos</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import BulkMessageSender from '@/components/whatsapp/BulkMessageSender.vue'

const store = useStore()
const toast = useToast()

// Estados computados
const isConnected = computed(() => store.getters['whatsapp/isConnected'])
const contacts = computed(() => store.getters['whatsapp/contacts'])
const groups = computed(() => store.getters['whatsapp/groups'])

// Métodos
const refreshData = async () => {
  if (!isConnected.value) {
    toast.warning('WhatsApp no está conectado')
    return
  }
  
  try {
    toast.info('Actualizando datos...')
    await Promise.all([
      store.dispatch('whatsapp/fetchContacts'),
      store.dispatch('whatsapp/fetchGroups')
    ])
    toast.success('Datos actualizados')
  } catch (error) {
    console.error('Error actualizando datos:', error)
    toast.error('Error al actualizar datos')
  }
}

// Lifecycle
onMounted(async () => {
  // Verificar estado de WhatsApp
  try {
    await store.dispatch('whatsapp/checkStatus')
  } catch (error) {
    console.warn('Error verificando estado WhatsApp:', error)
  }
})
</script>

<style scoped>
.pl-4 {
  padding-left: 1rem;
}
</style>