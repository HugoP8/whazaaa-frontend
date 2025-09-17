<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="800"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-icon class="mr-2" color="success">mdi-recycle</v-icon>
          Reutilizar Campaña: {{ metadata.originalName }}
        </div>
        <v-btn icon @click="closeModal" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text style="height: 600px;">
        <v-form ref="form" v-model="valid">
          <!-- Nombre de la campaña -->
          <v-text-field
            v-model="campaignData.name"
            label="Nombre de la nueva campaña"
            :rules="nameRules"
            required
            prepend-icon="mdi-tag"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <!-- Mensaje -->
          <v-textarea
            v-model="campaignData.message"
            label="Mensaje"
            :rules="messageRules"
            required
            prepend-icon="mdi-message-text"
            variant="outlined"
            rows="4"
            class="mb-4"
          ></v-textarea>

          <!-- Lista de destinatarios -->
          <v-card variant="outlined" class="mb-4">
            <v-card-subtitle class="d-flex justify-space-between align-center">
              <div>
                <v-icon class="mr-2">mdi-account-group</v-icon>
                Destinatarios ({{ campaignData.recipients?.length || 0 }})
                <v-chip size="small" :color="typeColor" variant="tonal" class="ml-2">
                  {{ typeDisplay }}
                </v-chip>
              </div>
            </v-card-subtitle>

            <v-card-text style="max-height: 200px; overflow-y: auto;">
              <v-list density="compact">
                <v-list-item
                  v-for="(recipient, index) in campaignData.recipients"
                  :key="index"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-icon :color="typeColor">
                      {{ campaignData.type === 'groups' ? 'mdi-account-group' : 'mdi-account' }}
                    </v-icon>
                  </template>
                  
                  <v-list-item-title>{{ recipient.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="recipient.jid">{{ recipient.jid }}</v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="removeRecipient(index)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Media existente -->
          <v-card v-if="campaignData.mediaPath" variant="outlined" class="mb-4">
            <v-card-subtitle>
              <v-icon class="mr-2">mdi-paperclip</v-icon>
              Archivo adjunto original
            </v-card-subtitle>
            <v-card-text class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-file</v-icon>
                <span>{{ getFileName(campaignData.mediaPath) }}</span>
              </div>
              <v-btn
                size="small"
                color="error"
                variant="text"
                @click="removeMedia"
              >
                <v-icon>mdi-delete</v-icon>
                Eliminar
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Nuevo archivo -->
          <v-file-input
            v-model="newFile"
            label="Nuevo archivo adjunto (opcional)"
            accept=".jpg,.jpeg,.png,.mp4,.pdf,.doc,.docx"
            prepend-icon="mdi-attachment"
            variant="outlined"
            show-size
            @change="handleFileUpload"
          ></v-file-input>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="closeModal"
          :disabled="isLaunching"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          @click="launchCampaign"
          :disabled="!isValid || isLaunching"
          :loading="isLaunching"
        >
          <v-icon start>mdi-send</v-icon>
          {{ isLaunching ? 'Enviando...' : 'Enviar Campaña' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const props = defineProps({
  isOpen: Boolean,
  campaignId: [String, Number]
})

const emit = defineEmits(['close', 'success'])

const store = useStore()
const toast = useToast()

// Estado del modal
const isLaunching = ref(false)
const valid = ref(false)
const form = ref(null)
const campaignData = ref({
  name: '',
  message: '',
  recipients: [],
  type: 'contacts',
  mediaPath: null
})
const metadata = ref({
  originalName: ''
})
const newFile = ref(null)

// Reglas de validación
const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => v.length >= 3 || 'El nombre debe tener al menos 3 caracteres'
]

const messageRules = [
  v => !!v || 'El mensaje es requerido',
  v => v.length >= 1 || 'El mensaje no puede estar vacío'
]

// Computadas
const typeDisplay = computed(() => {
  return campaignData.value.type === 'groups' ? 'Grupos' : 'Contactos'
})

const typeColor = computed(() => {
  return campaignData.value.type === 'groups' ? 'primary' : 'success'
})

const isValid = computed(() => {
  return valid.value &&
         campaignData.value.name?.trim() &&
         campaignData.value.message?.trim() &&
         campaignData.value.recipients?.length > 0
})

// Métodos
const loadCampaignData = async () => {
  if (!props.campaignId) return

  try {
    console.log('[ReuseCampaignModal] Cargando datos de reutilización para campaña:', props.campaignId)
    const response = await store.dispatch('campaigns/getCampaignReuseData', props.campaignId)
    
    console.log('[ReuseCampaignModal] Datos recibidos:', response)
    
    campaignData.value = { ...response.campaignData }
    metadata.value = { ...response.metadata }
    
    // Generar nombre sugerido
    if (!campaignData.value.name || campaignData.value.name === metadata.value.originalName) {
      campaignData.value.name = `${metadata.value.originalName} (Reutilizada)`
    }
  } catch (error) {
    console.error('[ReuseCampaignModal] Error cargando datos:', error)
    toast.error('Error al cargar datos de la campaña')
  }
}

const removeRecipient = (index) => {
  campaignData.value.recipients.splice(index, 1)
}

const removeMedia = () => {
  campaignData.value.mediaPath = null
}

const getFileName = (path) => {
  if (!path) return ''
  return path.split('/').pop() || path.split('\\').pop() || path
}

const handleFileUpload = (event) => {
  console.log('[ReuseCampaignModal] Nuevo archivo seleccionado:', event)
}

const launchCampaign = async () => {
  if (!isValid.value) {
    toast.error('Por favor completa todos los campos requeridos')
    return
  }

  isLaunching.value = true

  try {
    console.log('[ReuseCampaignModal] Lanzando campaña reutilizada con datos:', campaignData.value)
    
    // Preparar datos para envío
    const reuseData = {
      name: campaignData.value.name.trim(),
      message: campaignData.value.message.trim(),
      recipients: campaignData.value.recipients,
      type: campaignData.value.type,
      mediaPath: campaignData.value.mediaPath,
      newFile: newFile.value?.[0] || null
    }

    await store.dispatch('campaigns/createCampaignFromReuse', reuseData)

    toast.success(`Campaña "${reuseData.name}" creada y lanzada exitosamente`)
    emit('success')
    closeModal()
  } catch (error) {
    console.error('[ReuseCampaignModal] Error lanzando campaña:', error)
    toast.error('Error al crear la campaña reutilizada')
  } finally {
    isLaunching.value = false
  }
}

const closeModal = () => {
  // Limpiar datos
  campaignData.value = {
    name: '',
    message: '',
    recipients: [],
    type: 'contacts',
    mediaPath: null
  }
  metadata.value = {
    originalName: ''
  }
  newFile.value = null
  isLaunching.value = false
  valid.value = false
  
  if (form.value) {
    form.value.reset()
  }

  emit('close')
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.campaignId) {
    loadCampaignData()
  }
})
</script>

<style scoped>
.v-card-subtitle {
  font-weight: 600;
}

.v-list-item {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>