<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-btn
            icon
            @click="$router.back()"
            class="mr-3"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">
            Nueva Campaña
          </h1>
        </div>
      </v-col>
    </v-row>
    
    <v-form
      v-model="valid"
      @submit.prevent="handleSubmit"
      ref="form"
    >
      <v-row>
        <!-- Información de la campaña -->
        <v-col cols="12" md="8">
          <v-card elevation="2" rounded="xl">
            <v-card-title>
              <v-icon class="mr-2">mdi-information</v-icon>
              Información de la Campaña
            </v-card-title>
            
            <v-card-text>
              <v-text-field
                v-model="campaign.name"
                label="Nombre de la campaña"
                :rules="[rules.required, rules.campaignName]"
                required
                class="mb-4"
              ></v-text-field>
              
              <v-textarea
                v-model="campaign.message"
                label="Mensaje"
                rows="8"
                :rules="[rules.required, rules.messageContent]"
                required
                counter
                maxlength="4096"
                hint="Puedes usar variables como {nombre} para personalizar"
                persistent-hint
                class="mb-4"
              ></v-textarea>
              
              <v-file-input
                v-model="campaign.media"
                label="Archivo multimedia (opcional)"
                accept="image/*,video/*,.pdf,.doc,.docx"
                prepend-icon="mdi-paperclip"
                show-size
                :rules="[rules.fileSize, rules.fileType]"
                class="mb-4"
              ></v-file-input>
              
              <v-select
                v-model="campaign.delay"
                label="Retraso entre mensajes"
                :items="delayOptions"
                item-title="text"
                item-value="value"
                prepend-icon="mdi-timer"
              ></v-select>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Destinatarios -->
        <v-col cols="12" md="4">
          <v-card elevation="2" rounded="xl">
            <v-card-title>
              <v-icon class="mr-2">mdi-account-multiple</v-icon>
              Destinatarios
            </v-card-title>
            
            <v-card-text>
              <v-tabs
                v-model="recipientTab"
                color="primary"
                grow
              >
                <v-tab value="contacts">
                  <v-icon start>mdi-contacts</v-icon>
                  Contactos
                </v-tab>
                <v-tab value="groups">
                  <v-icon start>mdi-account-group</v-icon>
                  Grupos
                </v-tab>
                <v-tab value="manual">
                  <v-icon start>mdi-pencil</v-icon>
                  Manual
                </v-tab>
              </v-tabs>
              
              <v-window v-model="recipientTab">
                <!-- Contactos -->
                <v-window-item value="contacts">
                  <div class="mt-4">
                    <v-text-field
                      v-model="contactSearch"
                      label="Buscar contactos"
                      prepend-inner-icon="mdi-magnify"
                      density="compact"
                      hide-details
                      class="mb-2"
                    ></v-text-field>
                    
                    <v-list
                      density="compact"
                      max-height="400"
                      class="overflow-y-auto"
                    >
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
                        
                        <v-list-item-title>
                          {{ contact.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ contact.phone }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-window-item>
                
                <!-- Grupos -->
                <v-window-item value="groups">
                  <div class="mt-4">
                    <v-alert
                      type="warning"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      v-if="hasGroupsWithoutParticipants"
                    >
                      <v-icon start>mdi-alert</v-icon>
                      <strong>PROBLEMA:</strong> Los grupos no tienen datos de participantes desde el backend.
                      <br><small>Revisa los logs de la consola para ver qué está llegando exactamente.</small>
                    </v-alert>
                    
                    <v-list
                      density="compact"
                      max-height="400"
                      class="overflow-y-auto"
                    >
                      <v-list-item
                        v-for="group in groups"
                        :key="group.id"
                      >
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="selectedGroups"
                            :value="group.id"
                            hide-details
                            density="compact"
                          ></v-checkbox>
                        </template>
                        
                        <v-list-item-title>
                          {{ group.subject }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <strong>Participantes del backend:</strong> {{ group.participantJids?.length || group.participants || 0 }}
                          <br>
                          <small class="text-grey">ID: {{ group.id }}</small>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-window-item>
                
                <!-- Manual -->
                <v-window-item value="manual">
                  <div class="mt-4">
                    <v-textarea
                      v-model="manualNumbers"
                      label="Números de teléfono"
                      placeholder="Ingresa un número por línea&#10;+521234567890&#10;+525555555555"
                      rows="10"
                      hint="Incluye el código de país"
                      persistent-hint
                    ></v-textarea>
                  </div>
                </v-window-item>
              </v-window>
              
              <v-divider class="my-4"></v-divider>
              
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
              >
                Total destinatarios: <strong>{{ totalRecipients }}</strong>
              </v-alert>
              
              <!-- Alerta cuando no hay participantes REALES en los grupos -->
              <v-alert
                v-if="hasGroupsWithoutParticipants"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                <v-icon start>mdi-alert-circle</v-icon>
                <strong>ERROR:</strong> Los grupos no tienen información de participantes del backend.
                <br>
                <small class="text-caption">
                  El backend debe cargar <code>group.participants</code> desde WhatsApp.
                  Revisa los logs de la consola para ver la estructura exacta.
                </small>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Botones de acción -->
      <v-row class="mt-4">
        <v-col cols="12" class="text-right">
          <v-btn
            variant="text"
            size="large"
            @click="$router.push('/campaigns')"
            class="mr-2"
          >
            Cancelar
          </v-btn>
          
          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="loading"
            :disabled="!valid || totalRecipients === 0"
          >
            <v-icon start>mdi-send</v-icon>
            Enviar Campaña
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import * as validators from '@/utils/validators'
import { MESSAGE_LIMITS, FILE_LIMITS } from '@/utils/constants'

const store = useStore()
const router = useRouter()
const toast = useToast()

const valid = ref(false)
const loading = ref(false)
const recipientTab = ref('contacts')
const contactSearch = ref('')

const campaign = ref({
  name: '',
  message: '',
  media: null,
  delay: 5000
})

const selectedContacts = ref([])
const selectedGroups = ref([])
const manualNumbers = ref('')

const contacts = computed(() => store.getters['whatsapp/contacts'])
const groups = computed(() => store.getters['whatsapp/groups'])

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
  
  console.log('[NewCampaign] Calculando destinatarios:')
  console.log('- Contactos seleccionados:', selectedContacts.value.length)
  console.log('- Grupos seleccionados:', selectedGroups.value.length)
  console.log('- Total grupos disponibles:', groups.value.length)
  
  // Agregar participantes de grupos - CONTAR PARTICIPANTES (mensaje irá al grupo, no individual)
  selectedGroups.value.forEach(groupId => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      // CONTAR participantes para mostrar al usuario cuántas personas recibirán el mensaje
      // Nota: El mensaje se enviará al GRUPO, no a cada participante individualmente
      const participantCount = group.participantJids?.length || group.participants || 0
      
      console.log(`🔍 GRUPO COMPLETO:`, group)
      console.log(`📊 participantJids:`, group.participantJids)
      
      // Para obtener los números de teléfono:
      const phoneNumbers = group.participantJids?.map(jid => {
        // Convertir JID a número de teléfono
        return jid.includes('@s.whatsapp.net') ? jid.split('@')[0] : null;
      }).filter(Boolean) || [];
      
      console.log(`📞 Números del grupo ${group.subject}:`, phoneNumbers)
      console.log(`🔍 GRUPO ${group.subject}:`)
      console.log(`  - participantJids.length: ${group.participantJids?.length || 'undefined'}`)
      console.log(`  - participants (fallback): ${group.participants || 'undefined'}`) 
      console.log(`  - USANDO: ${participantCount} (de participantJids)`)
      
      total += participantCount
    } else {
      console.log(`❌ Grupo ${groupId} no encontrado`)
    }
  })
  
  // Agregar números manuales
  if (manualNumbers.value) {
    const numbers = manualNumbers.value.split('\n').filter(n => n.trim())
    total += numbers.length
    console.log('- Números manuales:', numbers.length)
  }
  
  console.log('- TOTAL DESTINATARIOS:', total)
  return total
})

// Detectar grupos sin información de participantes
const hasGroupsWithoutParticipants = computed(() => {
  return groups.value.length > 0 && groups.value.some(group => 
    (!group.participantJids || group.participantJids.length === 0) && (!group.participants || group.participants === 0)
  )
})

// ❌ ELIMINÉ TODAS LAS FUNCIONES DE ESTIMACIÓN - SOLO DATOS REALES

const delayOptions = [
  { text: '1 segundo', value: 1000 },
  { text: '2 segundos', value: 2000 },
  { text: '3 segundos', value: 3000 },
  { text: '5 segundos', value: 5000 },
  { text: '10 segundos', value: 10000 },
  { text: '15 segundos', value: 15000 },
  { text: '30 segundos', value: 30000 },
  { text: '1 minuto', value: 60000 }
]

const rules = {
  required: validators.required,
  campaignName: validators.campaignName,
  messageContent: validators.messageContent,
  fileSize: validators.fileSize(FILE_LIMITS.MAX_SIZE),
  fileType: (files) => {
    if (!files || files.length === 0) return true
    const file = files[0]
    const allowedTypes = [
      ...FILE_LIMITS.ALLOWED_TYPES.IMAGE.map(ext => `image/${ext}`),
      ...FILE_LIMITS.ALLOWED_TYPES.DOCUMENT.map(ext => `application/${ext}`),
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const extension = file.name.split('.').pop().toLowerCase()
    const isAllowed = Object.values(FILE_LIMITS.ALLOWED_TYPES).flat().includes(extension)
    return isAllowed || 'Tipo de archivo no permitido'
  }
}

const handleSubmit = async () => {
  if (!valid.value) return
  
  // Verificar que WhatsApp esté conectado
  if (!store.getters['whatsapp/isConnected']) {
    toast.error('WhatsApp no está conectado. Conecta primero.')
    return
  }
  
  if (totalRecipients.value === 0) {
    toast.error('Debes seleccionar al menos un destinatario')
    return
  }
  
  loading.value = true
  
  try {
    // Preparar destinatarios de contactos individuales
    const contactRecipients = [...selectedContacts.value]
    
    // Agregar números manuales como contactos
    if (manualNumbers.value) {
      const numbers = manualNumbers.value
        .split('\n')
        .filter(n => n.trim())
        .map(n => {
          const cleaned = n.trim()
          // Agregar formato WhatsApp si no lo tiene
          return cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`
        })
      contactRecipients.push(...numbers)
    }
    
    // Preparar destinatarios de grupos (usar ID de grupo, no participantes)
    const groupRecipients = selectedGroups.value.map(groupId => {
      const group = groups.value.find(g => g.id === groupId)
      if (group) {
        console.log(`📋 Agregando grupo: ${group.subject} (ID: ${groupId})`)
        return groupId // Usar el ID del grupo directamente
      } else {
        console.warn(`⚠️ Grupo ${groupId} no encontrado`)
        return null
      }
    }).filter(Boolean)
    
    console.log(`👥 Contactos individuales: ${contactRecipients.length}`)
    console.log(`📱 Grupos seleccionados: ${groupRecipients.length}`)
    console.log(`📧 Grupos:`, groupRecipients)
    
    // Determinar el tipo de campaña y destinatarios
    let campaignData
    
    if (groupRecipients.length > 0 && contactRecipients.length === 0) {
      // Solo grupos
      campaignData = {
        name: campaign.value.name,
        message: campaign.value.message,
        recipients: groupRecipients, // IDs de grupos
        type: 'groups',
        delay: campaign.value.delay,
        media: campaign.value.media
      }
      console.log(`📢 Campaña de GRUPOS: ${groupRecipients.length} grupos`)
      
    } else if (contactRecipients.length > 0 && groupRecipients.length === 0) {
      // Solo contactos
      campaignData = {
        name: campaign.value.name,
        message: campaign.value.message,
        recipients: contactRecipients, // JIDs de contactos
        type: 'contacts',
        delay: campaign.value.delay,
        media: campaign.value.media
      }
      console.log(`📞 Campaña de CONTACTOS: ${contactRecipients.length} contactos`)
      
    } else if (groupRecipients.length > 0 && contactRecipients.length > 0) {
      // Mixta (crear dos campañas separadas o manejar en backend)
      // Por ahora, crear campaña mixta pero enviar en recipients
      campaignData = {
        name: campaign.value.name,
        message: campaign.value.message,
        recipients: [...contactRecipients, ...groupRecipients], // Mezclar ambos
        type: 'mixed',
        contactRecipients,
        groupRecipients,
        delay: campaign.value.delay,
        media: campaign.value.media
      }
      console.log(`🔄 Campaña MIXTA: ${contactRecipients.length} contactos + ${groupRecipients.length} grupos`)
      
    } else {
      throw new Error('No se han seleccionado destinatarios válidos')
    }
    
    // Usar la nueva acción del store WhatsApp
    const result = await store.dispatch('whatsapp/createCampaign', campaignData)
    
    if (result && result.id) {
      // Ejecutar la campaña inmediatamente
      try {
        await store.dispatch('whatsapp/executeCampaign', result.id)
        toast.success(`Campaña "${campaign.value.name}" creada y ejecutándose`)
      } catch (executeError) {
        console.error('Error ejecutando campaña:', executeError)
        toast.warning(`Campaña creada pero error al ejecutar: ${executeError.message}`)
      }
    }
    
    // Dar tiempo para que se actualice el store antes de navegar
    setTimeout(() => {
      router.push('/campaigns')
    }, 100)
    
  } catch (error) {
    console.error('Error creando campaña:', error)
    toast.error(error.message || 'Error al crear la campaña')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('[NewCampaign] Componente montado')
  
  // Cargar contactos y grupos
  try {
    await store.dispatch('whatsapp/fetchContacts')
    console.log('[NewCampaign] Contactos cargados:', contacts.value.length)
  } catch (error) {
    console.error('[NewCampaign] Error cargando contactos:', error)
  }
  
  try {
    await store.dispatch('whatsapp/fetchGroups')
    console.log('[NewCampaign] Grupos cargados:', groups.value.length)
    
    // Mostrar estructura de los primeros 3 grupos para depuración
    groups.value.slice(0, 3).forEach((group, index) => {
      console.log(`[NewCampaign] Grupo ${index + 1}:`, {
        id: group.id,
        name: group.subject || group.name,
        participantJids: group.participantJids?.length || 'No participantJids',
        participants: group.participants?.length || group.participants || 'No participants',
        members: group.members?.length || 'No members', 
        size: group.size || 'No size',
        structure: Object.keys(group)
      })
    })
    
    // Verificar si hay grupos sin participantes
    const groupsWithoutParticipants = groups.value.filter(group => 
      (!group.participantJids || group.participantJids.length === 0) && (!group.participants || group.participants === 0)
    ).length
    
    if (groupsWithoutParticipants > 0) {
      console.warn(`[NewCampaign] ⚠️ ${groupsWithoutParticipants}/${groups.value.length} grupos no tienen información de participantes`)
      console.warn('[NewCampaign] 🔧 Esto es un problema del BACKEND - necesita cargar participants de WhatsApp')
    }
  } catch (error) {
    console.error('[NewCampaign] Error cargando grupos:', error)
  }
})
</script>