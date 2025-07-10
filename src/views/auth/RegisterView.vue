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
        mdi-account-plus
      </v-icon>
      <h1 class="text-h4 font-weight-bold">
        Crear Cuenta
      </h1>
      <p class="text-body-2 text-grey mt-2">
        Únete y empieza a enviar mensajes
      </p>
    </v-card-title>
    
    <v-card-text>
      <v-form
        v-model="valid"
        @submit.prevent="handleRegister"
        ref="form"
      >
        <v-text-field
          v-model="form.name"
          label="Nombre completo"
          prepend-inner-icon="mdi-account"
          :rules="[rules.required]"
          required
          class="mb-2"
        ></v-text-field>
        
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
          class="mb-2"
        ></v-text-field>
        
        <v-text-field
          v-model="form.confirmPassword"
          label="Confirmar contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check"
          :rules="[rules.required, passwordMatch]"
          required
          class="mb-4"
        ></v-text-field>
        
        <v-checkbox
          v-model="acceptTerms"
          :rules="[rules.required]"
          color="primary"
          class="mb-4"
        >
          <template v-slot:label>
            Acepto los
            <a href="#" @click.prevent>términos y condiciones</a>
          </template>
        </v-checkbox>
        
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="loading"
          :disabled="!valid || !acceptTerms"
        >
          Crear Cuenta
        </v-btn>
      </v-form>
    </v-card-text>
    
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text
        color="primary"
        @click="$router.push('/login')"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import * as validators from '@/utils/validators'

const store = useStore()

const valid = ref(false)
const showPassword = ref(false)
const acceptTerms = ref(false)
const loading = ref(false)
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: validators.required,
  email: validators.email,
  minLength: validators.minLength
}

const passwordMatch = (value) => {
  return value === form.value.password || 'Las contraseñas no coinciden'
}

const handleRegister = async () => {
  if (!valid.value) return
  
  loading.value = true
  try {
    await store.dispatch('auth/register', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password
    })
  } catch (error) {
    // El error ya fue manejado por el store
  } finally {
    loading.value = false
  }
}
</script>