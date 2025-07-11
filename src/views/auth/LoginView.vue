<template>
  <v-card
    elevation="12"
    rounded="xl"
    class="pa-6 mx-auto mt-10"
    style="max-width: 400px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);"
  >
    <v-card-title class="text-center pa-6">
      <v-icon
        size="80"
        color="teal"
        class="mb-4"
        style="background: white; border-radius: 50%; padding: 10px;"
      >
        mdi-whatsapp
      </v-icon>
      <h1 class="text-h3 font-weight-bold text-teal-darken-2">
        Whazaaa
      </h1>
      <p class="text-body-1 text-grey-darken-1 mt-2">
        Inicia sesión para continuar
      </p>
    </v-card-title>
    
    <v-card-text>
      <v-form ref="form">
        <v-text-field
          v-model="email"
          label="Correo Electrónico"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          color="teal"
          required
          class="mb-4"
          density="comfortable"
        ></v-text-field>
        
        <v-text-field
          v-model="password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          color="teal"
          required
          class="mb-6"
          density="comfortable"
        ></v-text-field>
        
        <v-checkbox
          v-model="rememberMe"
          label="Recordarme"
          color="teal"
          class="mb-6"
          density="compact"
        ></v-checkbox>
        
        <v-btn
          color="teal-darken-2"
          block
          size="large"
          :loading="loading"
          @click="handleLogin"
          class="mb-4"
          style="text-transform: none; letter-spacing: 0.5px;"
        >
          <span class="text-white text-body-1 font-weight-medium">Iniciar Sesión</span>
        </v-btn>

        <!-- Mensaje de éxito con animación -->
        <v-alert
          v-if="showSuccess"
          type="success"
          variant="tonal"
          class="text-center mb-4"
          transition="scale-transition"
        >
          ¡Inicio de sesión exitoso! Redirigiendo...
        </v-alert>
      </v-form>
    </v-card-text>
    
    <v-card-actions class="justify-center">
      <v-btn
        text
        color="teal-darken-2"
        @click="$router.push('/register')"
        class="text-body-2 font-weight-medium"
      >
        ¿No tienes cuenta? Regístrate
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

const router = useRouter()
const store = useStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const showSuccess = ref(false)

const handleLogin = async () => {
  console.log('handleLogin iniciado - email:', email.value, 'password:', password.value);
  if (!email.value || !password.value) {
    console.log('Campos email o contraseña vacíos');
    return;
  }

  loading.value = true;
  try {
    const loginData = {
      email: email.value,
      password: password.value
    };
    console.log('Enviando solicitud a /api/auth/login con:', loginData);
    const response = await axios.post('http://localhost:3000/api/auth/login', loginData);
    console.log('Respuesta del servidor:', response.data);
    if (response.status === 200) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        store.commit('auth/SET_TOKEN', response.data.token);
        store.commit('auth/SET_USER', response.data.user || {});
        console.log('Token y usuario guardados en Vuex');
      }
      showSuccess.value = true; // Mostrar mensaje de éxito
      console.log('Login exitoso, preparando redirección');
      setTimeout(() => {
        router.push('/dashboard').then(() => {
          console.log('Redirección completada');
        }).catch(err => {
          console.error('Error en redirección:', err);
        });
      }, 1500); // Retraso de 1.5 segundos para mostrar el mensaje
    } else {
      console.log('Respuesta no exitosa:', response.status, response.data);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error.response ? error.response.data : error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.v-card {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.v-card:hover {
  transform: translateY(-5px);
}
</style>