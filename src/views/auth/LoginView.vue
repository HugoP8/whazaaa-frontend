<template>
  <v-card
    elevation="8"
    rounded="xl"
    class="pa-4"
  >
    <v-card-title class="text-center pa-8">
      <v-icon
        size="64"
        color="primary"
        class="mb-4 d-block mx-auto"
      >
        mdi-whatsapp
      </v-icon>
      <h1 class="text-h4 font-weight-bold">
        WhatsApp Mass Sender
      </h1>
      <p class="text-body-2 text-grey mt-2">
        Inicia sesión para continuar
      </p>
    </v-card-title>
    
    <v-card-text>
      <v-form
        v-model="valid"
        @submit.prevent="handleLogin"
        ref="form"
      >
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          prepend-inner-icon="mdi-email"
          :rules="[rules.required, rules.email]"
          required
          class="mb-2"
        ></v-text-field>
        
        <v-text-field
          v-model="form.password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required, rules.minLength(6)]"
          required
          class="mb-4"
        ></v-text-field>
        
        <v-checkbox
          v-model="rememberMe"
          label="Recordarme"
          color="primary"
          class="mb-4"
        ></v-checkbox>
        
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
          :disabled="!valid"
        >
          Iniciar Sesión
        </v-btn>
      </v-form>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text
        color="primary"
        @click="$router.push('/register')"
      >
        ¿No tienes cuenta? Regístrate
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import * as validators from '@/utils/validators'

const store = useStore()
const router = useRouter()

const valid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})

const rules = {
  required: validators.required,
  email: validators.email,
  minLength: validators.minLength
}

const handleLogin = async () => {
  if (!valid.value) return
  
  loading.value = true
  try {
    await store.dispatch('auth/login', form.value)
  } catch (error) {
    // El error ya fue manejado por el store
  } finally {
    loading.value = false
  }
}
</script>