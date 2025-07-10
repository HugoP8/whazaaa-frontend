<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">
            Contactos
          </h1>
          <v-btn
            color="primary"
            size="large"
            @click="syncContacts"
            :loading="syncing"
          >
            <v-icon start>mdi-sync</v-icon>
            Sincronizar
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-text>
            <v-text-field
              v-model="search"
              label="Buscar contactos"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              class="mb-4"
            ></v-text-field>
            
            <v-data-table
              :headers="headers"
              :items="contacts"
              :search="search"
              :items-per-page="10"
            >
              <template v-slot:item.avatar="{ item }">
                <v-avatar size="40">
                  <v-icon v-if="!item.profilePicUrl">
                    mdi-account-circle
                  </v-icon>
                  <v-img v-else :src="item.profilePicUrl"></v-img>
                </v-avatar>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  @click="sendMessage(item)"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const search = ref('')
const syncing = ref(false)

const contacts = computed(() => store.getters['whatsapp/contacts'])

const headers = [
  { title: '', key: 'avatar', sortable: false },
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

const syncContacts = async () => {
  syncing.value = true
  try {
    await store.dispatch('whatsapp/syncContacts')
  } catch (error) {
    console.error('Error sincronizando contactos:', error)
  } finally {
    syncing.value = false
  }
}

const sendMessage = (contact) => {
  // Ir a nueva campaña con contacto preseleccionado
  router.push({
    path: '/campaigns/new',
    query: { contact: contact.phone }
  })
}
</script>