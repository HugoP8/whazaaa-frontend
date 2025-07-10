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
                          {{ group.participants?.length || 0 }} participantes
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
import { MESSAGE_DELAY_OPTIONS, FILE_SIZE_LIMIT, ALLOWED_FILE_TYPES } from '@/utils/constants'

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
  
  // Agregar participantes de grupos
  selectedGroups.value.forEach(groupId => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      total += group.participants?.length || 0
    }
  })
  
  // Agregar números manuales
  if (manualNumbers.value) {
    const numbers = manualNumbers.value.split('\n').filter(n => n.trim())
    total += numbers.length
  }
  
  return total
})

const delayOptions = MESSAGE_DELAY_OPTIONS

const rules = {
  required: validators.required,
  campaignName: validators.campaignName,
  messageContent: validators.messageContent,
  fileSize: validators.fileSize(FILE_SIZE_LIMIT),
  fileType: validators.fileType(ALLOWED_FILE_TYPES)
}

const handleSubmit = async () => {
  if (!valid.value) return
  
  loading.value = true
  
  try {
    // Preparar destinatarios
    const recipients = [...selectedContacts.value]
    
    if (manualNumbers.value) {
      const numbers = manualNumbers.value
        .split('\n')
        .filter(n => n.trim())
        .map(n => {
          const cleaned = n.trim()
          // Agregar formato WhatsApp si no lo tiene
          return cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`
        })
      recipients.push(...numbers)
    }
    
    const campaignData = {
      name: campaign.value.name,
      message: campaign.value.message,
      recipients,
      groupIds: selectedGroups.value,
      delay: campaign.value.delay,
      media: campaign.value.media
    }
    
    await store.dispatch('campaigns/createCampaign', campaignData)
    router.push('/campaigns')
    
  } catch (error) {
    console.error('Error creando campaña:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Cargar contactos y grupos
  store.dispatch('whatsapp/fetchContacts')
  store.dispatch('whatsapp/fetchGroups')
})
</script>