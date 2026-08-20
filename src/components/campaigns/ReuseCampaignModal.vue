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
          <v-card v-if="(campaignData.mediaPath || metadata.mediaStatus) && !removeExistingMedia" variant="outlined" class="mb-4">
            <v-card-subtitle>
              <v-icon class="mr-2">mdi-paperclip</v-icon>
              Archivo adjunto original
            </v-card-subtitle>
            <v-card-text>
              <!-- Advertencia si el media no está disponible -->
              <v-alert
                v-if="metadata.mediaStatus === 'missing'"
                type="warning"
                variant="tonal"
                class="mb-3"
              >
                <v-icon start>mdi-alert</v-icon>
                La imagen original no está disponible. Por favor, sube un nuevo archivo.
              </v-alert>

              <div v-if="campaignData.mediaPath" class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-icon
                    class="mr-2"
                    :color="metadata.mediaStatus === 'missing' ? 'error' : 'primary'"
                  >
                    {{ metadata.mediaStatus === 'missing' ? 'mdi-file-remove' : 'mdi-file' }}
                  </v-icon>
                  <span>{{ getFileName(campaignData.mediaPath) }}</span>
                  <v-chip
                    v-if="metadata.mediaStatus"
                    size="small"
                    :color="metadata.mediaStatus === 'available' ? 'success' : 'error'"
                    variant="tonal"
                    class="ml-2"
                  >
                    {{ metadata.mediaStatus === 'available' ? 'Disponible' : 'No disponible' }}
                  </v-chip>
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
              </div>
            </v-card-text>
          </v-card>

          <!-- Mensaje cuando se elimina archivo existente -->
          <v-alert
            v-if="removeExistingMedia"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <v-icon start>mdi-information</v-icon>
            El archivo multimedia original será eliminado de la campaña.
            <template v-slot:append>
              <v-btn
                size="small"
                color="primary"
                variant="text"
                @click="restoreExistingMedia"
              >
                Conservar
              </v-btn>
            </template>
          </v-alert>

          <!-- Nuevo archivo -->
          <v-file-input
            v-model="newFile"
            label="Nuevo archivo adjunto (opcional)"
            accept=".jpg,.jpeg,.png,.mp4,.pdf,.doc,.docx"
            prepend-icon="mdi-attachment"
            variant="outlined"
            show-size
            @update:model-value="handleFileUpload"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { mediaHandler } from '@/utils/mediaHandler'

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
  originalName: '',
  mediaStatus: null // 'available' | 'missing'
})
const newFile = ref(null)
const removeExistingMedia = ref(false) // Nueva variable para controlar eliminación

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
    const response = await store.dispatch('campaigns/getCampaignReuseData', props.campaignId)

    campaignData.value = { ...response.campaignData }
    metadata.value = { ...response.metadata }

    // Inicializar estado de eliminación de media
    removeExistingMedia.value = false

    // Verificar estado del media
    if (metadata.value.mediaStatus === 'missing') {
      toast.warning('La imagen original no está disponible')
      removeExistingMedia.value = true
    }

    // Generar nombre sugerido (sin repetir el sufijo si ya existe)
    if (!campaignData.value.name || campaignData.value.name === metadata.value.originalName) {
      const cleanName = (metadata.value.originalName || '').replace(/\s*\((Reutilizada|Reenviada|Copia)\)\s*$/, '').trim()
      campaignData.value.name = `${cleanName} (Reutilizada)`
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
  removeExistingMedia.value = true
  newFile.value = null
  toast.info('Archivo multimedia será eliminado de la campaña')
}

const restoreExistingMedia = () => {
  removeExistingMedia.value = false
  toast.success('Archivo multimedia original será conservado')
}

const getFileName = (path) => {
  if (!path) return ''
  return path.split('/').pop() || path.split('\\').pop() || path
}

const handleFileUpload = async (files) => {
  if (!files || (Array.isArray(files) && files.length === 0)) return

  let fileArray = files
  if (files instanceof FileList) {
    fileArray = Array.from(files)
  } else if (!Array.isArray(files)) {
    fileArray = [files]
  }

  fileArray = fileArray.filter(file => file && file instanceof File)
  if (fileArray.length === 0) return

  try {
    const customMediaHandler = new (await import('@/utils/mediaHandler')).MediaHandler({ showToast: false })
    const validation = customMediaHandler.validateFiles(fileArray)

    if (!validation.isValid) {
      newFile.value = null
      validation.invalidFiles.forEach(error => toast.error(error.error))
      return
    }

    const file = fileArray[0]
    if (customMediaHandler.isImageFile(file)) {
      try { await customMediaHandler.generatePreview(file) } catch {}
    }

    toast.success(`Archivo "${file.name}" seleccionado correctamente`)

    if (removeExistingMedia.value) {
      removeExistingMedia.value = false
      toast.info('Archivo nuevo seleccionado - se reemplazará la imagen existente')
    }
  } catch (error) {
    console.error('[ReuseCampaignModal] Error procesando archivo:', error)
    toast.error(`Error procesando archivo: ${error.message}`)
    newFile.value = null
  }
}

const buildFormData = () => {
  try {
    const formData = new FormData()

    formData.append('name', campaignData.value.name.trim())
    formData.append('message', campaignData.value.message.trim())
    formData.append('recipients', JSON.stringify(campaignData.value.recipients))
    formData.append('type', campaignData.value.type)

    // Detectar archivo nuevo (Vuetify 3 puede enviar File directo o array)
    const hasNewFile = newFile.value && (
      (newFile.value instanceof File) ||
      (newFile.value.length > 0)
    )
    const hasExistingMedia = campaignData.value.mediaPath
    const removeMedia = removeExistingMedia.value || false

    if (removeMedia === true) {
      formData.append('removeMedia', 'true')
    } else if (hasNewFile) {
      let file = null
      if (newFile.value instanceof File) {
        file = newFile.value
      } else if (newFile.value[0] instanceof File) {
        file = newFile.value[0]
      }
      if (file) {
        formData.append('media', file)
      } else {
        console.error('[ReuseCampaignModal] hasNewFile true pero no se pudo extraer el archivo')
      }
    } else if (hasExistingMedia) {
      formData.append('existingMediaPath', campaignData.value.mediaPath)
    }

    return formData
  } catch (error) {
    console.error('❌ [ReuseCampaignModal] Error building FormData:', error)
    throw new Error(`Error procesando datos de campaña: ${error.message}`)
  }
}

// Validación obligatoria antes de enviar
const validateReuseData = () => {
  const hasNewFile = newFile.value && (
    (newFile.value instanceof File) ||
    (newFile.value.length > 0)
  )
  const removeMedia = removeExistingMedia.value

  if (removeMedia && hasNewFile) {
    toast.warning('Se eliminará el archivo existente. El nuevo archivo será ignorado.')
  }

  return true
}

const validateForm = () => {
  if (!isValid.value) {
    toast.error('Por favor completa todos los campos requeridos')
    return false
  }

  // Ejecutar validación específica de reutilización
  return validateReuseData()
}

const listenToCampaignProgress = (campaignId) => {
  const socket = store.state.whatsapp.socket
  if (!socket) return

  // Escuchar eventos de progreso
  socket.on('campaign-progress', (data) => {
    if (data.campaignId === campaignId) {
      // progreso manejado por CampaignsView via polling
    }
  })

  socket.on('campaign-completed', (data) => {
    if (data.campaignId === campaignId) {
      toast.success(`Campaña completada: ${data.successCount}/${data.totalCount} mensajes enviados`)
    }
  })

  socket.on('campaign-cancelled', (data) => {
    if (data.campaignId === campaignId) {
      toast.info('Campaña cancelada')
    }
  })
}

const launchCampaign = async () => {
  if (!validateForm()) return

  isLaunching.value = true

  try {
    const formData = buildFormData()

    const result = await store.dispatch('campaigns/createCampaignFromReuse', {
      formData
    })

    if (result.success) {
      if (result.async) {
        // Campaña asíncrona - mostrar mensaje y cerrar modal
        toast.success(result.message || 'Campaña iniciada en segundo plano')

        // Escuchar progreso si tenemos campaignId
        if (result.campaignId) {
          listenToCampaignProgress(result.campaignId)
        }

      } else {
        // Campaña síncrona - mostrar éxito
        toast.success('Campaña completada exitosamente')
      }

      // Cerrar modal y refrescar
      closeModal()
      emit('success', result)

    } else {
      throw new Error(result.message || 'Error launching campaign')
    }

  } catch (error) {
    console.error('[ReuseCampaignModal] Error lanzando campaña:', error)
    toast.error(error.message || 'Error launching campaign')
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
    originalName: '',
    mediaStatus: null
  }
  newFile.value = null
  removeExistingMedia.value = false // Limpiar el flag de eliminación
  isLaunching.value = false
  valid.value = false

  if (form.value) {
    form.value.reset()
  }

  emit('close')
}

// Configurar eventos de WebSocket
const setupSocketEvents = () => {
  const socket = store.state.whatsapp.socket
  if (!socket) return

  // Escuchar eventos de finalización de campaña reutilizada
  socket.on('campaign-completed', (data) => {
    if (data.reused) {
      toast.success(`Campaña reutilizada completada: ${data.successCount}/${data.totalCount} mensajes enviados`, {
        timeout: 10000
      })
      store.dispatch('campaigns/fetchCampaigns')
    }
  })

  // Escuchar errores de campaña reutilizada
  socket.on('campaign-error', (data) => {
    toast.error(`Error en campaña reutilizada: ${data.error}`)
    store.dispatch('campaigns/fetchCampaigns')
  })
}

const cleanupSocketEvents = () => {
  const socket = store.state.whatsapp.socket
  if (!socket) return

  socket.off('campaign-completed')
  socket.off('campaign-error')
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.campaignId) {
    loadCampaignData()
    setupSocketEvents()
  } else {
    cleanupSocketEvents()
  }
})

onMounted(() => {
  setupSocketEvents()
})

onUnmounted(() => {
  cleanupSocketEvents()
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