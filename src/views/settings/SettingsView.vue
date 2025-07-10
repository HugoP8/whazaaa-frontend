<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-6">
          Configuración
        </h1>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Perfil de usuario -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            Perfil de Usuario
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-text-field
                v-model="profile.name"
                label="Nombre"
                prepend-inner-icon="mdi-account"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="profile.email"
                label="Email"
                prepend-inner-icon="mdi-email"
                disabled
                class="mb-4"
              ></v-text-field>
              
              <v-btn
                type="submit"
                color="primary"
                :loading="savingProfile"
              >
                Guardar cambios
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- Cambiar contraseña -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            <v-icon class="mr-2">mdi-lock</v-icon>
            Cambiar Contraseña
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordForm.currentPassword"
                label="Contraseña actual"
                type="password"
                prepend-inner-icon="mdi-lock"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="passwordForm.newPassword"
                label="Nueva contraseña"
                type="password"
                prepend-inner-icon="mdi-lock-reset"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirmar nueva contraseña"
                type="password"
                prepend-inner-icon="mdi-lock-check"
                class="mb-4"
              ></v-text-field>
              
              <v-btn
                type="submit"
                color="primary"
                :loading="changingPassword"
              >
                Cambiar contraseña
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Configuración de WhatsApp -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title>
            <v-icon class="mr-2">mdi-whatsapp</v-icon>
            Configuración de WhatsApp
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="whatsappConfig.defaultDelay"
                  label="Delay por defecto (segundos)"
                  type="number"
                  min="3"
                  max="30"
                  prepend-inner-icon="mdi-timer"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="whatsappConfig.maxMessagesPerDay"
                  label="Máximo mensajes por día"
                  type="number"
                  min="50"
                  max="500"
                  prepend-inner-icon="mdi-counter"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-btn
              color="primary"
              @click="saveWhatsAppConfig"
              :loading="savingWhatsApp"
            >
              Guardar configuración
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Zona de peligro -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl" color="error" variant="tonal">
          <v-card-title>
            <v-icon class="mr-2">mdi-alert</v-icon>
            Zona de Peligro
          </v-card-title>
          <v-card-text>
            <v-btn
              color="error"
              @click="disconnectWhatsApp"
              :disabled="!isConnected"
            >
              <v-icon start>mdi-logout</v-icon>
              Desconectar WhatsApp
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

const store = useStore()
const toast = useToast()

const profile = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const whatsappConfig = ref({
  defaultDelay: 5,
  maxMessagesPerDay: 200
})

const savingProfile = ref(false)
const changingPassword = ref(false)
const savingWhatsApp = ref(false)

const currentUser = computed(() => store.getters['auth/currentUser'])
const isConnected = computed(() => store.getters['whatsapp/isConnected'])

const updateProfile = async () => {
  savingProfile.value = true
  try {
    await store.dispatch('auth/updateProfile', {
      name: profile.value.name
    })
  } catch (error) {
    console.error(error)
  } finally {
    savingProfile.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }
  
  changingPassword.value = true
  try {
    await store.dispatch('auth/changePassword', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error(error)
  } finally {
    changingPassword.value = false
  }
}

const saveWhatsAppConfig = () => {
  savingWhatsApp.value = true
  try {
    // Guardar en localStorage
    localStorage.setItem('whatsappConfig', JSON.stringify(whatsappConfig.value))
    toast.success('Configuración guardada')
  } catch (error) {
    toast.error('Error al guardar configuración')
  } finally {
    savingWhatsApp.value = false
  }
}

const disconnectWhatsApp = async () => {
  try {
    await store.dispatch('whatsapp/disconnect')
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  // Cargar datos del usuario
  if (currentUser.value) {
    profile.value.name = currentUser.value.name
    profile.value.email = currentUser.value.email
  }
  
  // Cargar configuración guardada
  const savedConfig = localStorage.getItem('whatsappConfig')
  if (savedConfig) {
    whatsappConfig.value = JSON.parse(savedConfig)
  }
})
</script>