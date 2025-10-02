<template>
  <div class="login-container fade-in-up">
    <v-card
      class="login-card shadow-2xl"
      max-width="420"
    >
      <!-- Header with Modern Design -->
      <div class="login-header">
        <div class="icon-container hover-scale">
          <v-icon
            size="64"
            color="white"
            class="login-icon"
          >
            mdi-whatsapp
          </v-icon>
        </div>

        <h1 class="login-title text-gradient">
          Whazaaa
        </h1>

        <p class="login-subtitle">
          Plataforma moderna de WhatsApp Business
        </p>

        <div class="header-decoration"></div>
      </div>

      <!-- Form Section -->
      <v-card-text class="login-form">
        <v-form ref="form" @submit.prevent="handleLogin" class="form-content">
          <div class="input-group slide-in-left">
            <v-text-field
              v-model="email"
              label="Correo Electrónico"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="primary"
              required
              class="modern-input"
              density="comfortable"
              hide-details="auto"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
          </div>

          <div class="input-group slide-in-right">
            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              color="primary"
              required
              class="modern-input"
              density="comfortable"
              hide-details="auto"
              :rules="[rules.required]"
            ></v-text-field>
          </div>

          <div class="form-options slide-in-left">
            <v-checkbox
              v-model="rememberMe"
              label="Recordarme"
              color="primary"
              density="compact"
              hide-details
              class="remember-checkbox"
            ></v-checkbox>
          </div>

          <div class="login-button-container slide-in-up">
            <v-btn
              color="primary"
              block
              size="large"
              :loading="loading"
              type="submit"
              class="login-btn hover-lift"
              variant="elevated"
              rounded="lg"
            >
              <v-icon start>mdi-login</v-icon>
              {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </v-btn>
          </div>

          <!-- Alert Messages -->
          <transition name="scale-fade">
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="modern-alert error-alert"
              rounded="lg"
              closable
              @click:close="error = null"
            >
              <template v-slot:prepend>
                <v-icon>mdi-alert-circle</v-icon>
              </template>
              {{ error }}
            </v-alert>
          </transition>

          <transition name="scale-fade">
            <v-alert
              v-if="showSuccess"
              type="success"
              variant="tonal"
              class="modern-alert success-alert"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon>mdi-check-circle</v-icon>
              </template>
              ¡Inicio de sesión exitoso! Redirigiendo...
            </v-alert>
          </transition>
        </v-form>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="login-footer">
        <div class="footer-content">
          <div class="divider-container">
            <v-divider></v-divider>
            <span class="divider-text">O</span>
            <v-divider></v-divider>
          </div>

          <v-btn
            variant="text"
            color="primary"
            @click="$router.push('/register')"
            class="register-btn hover-scale"
            rounded="lg"
          >
            <v-icon start>mdi-account-plus</v-icon>
            ¿No tienes cuenta? Regístrate
          </v-btn>

          <div class="footer-links">
            <v-btn
              variant="text"
              size="small"
              color="grey"
              class="footer-link"
            >
              Términos de Servicio
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              color="grey"
              class="footer-link"
            >
              Privacidad
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <!-- Background Elements -->
    <div class="login-bg-elements">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()
const store = useStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const error = ref(null)

// Form validation rules
const rules = reactive({
  required: value => !!value || 'Este campo es requerido',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  }
})

const handleLogin = async () => {
  console.log('handleLogin iniciado - email:', email.value, 'password:', password.value)
  if (!email.value || !password.value) {
    error.value = 'Por favor, completa todos los campos'
    console.log('Campos email o contraseña vacíos')
    return
  }

  loading.value = true
  error.value = null
  showSuccess.value = false

  try {
    const loginData = {
      email: email.value,
      password: password.value
    }
    console.log('Enviando solicitud a /api/auth/login con:', loginData)
    const response = await axios.post('http://localhost:3000/api/auth/login', loginData)
    console.log('Respuesta del servidor:', response.data)
    
    if (response.status === 200 && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user || {}))
      store.commit('auth/SET_TOKEN', response.data.token)
      store.commit('auth/SET_USER', response.data.user || {})
      console.log('Token y usuario guardados en localStorage y Vuex')
      showSuccess.value = true
      console.log('Login exitoso, preparando redirección')
      setTimeout(() => {
        router.push('/dashboard').then(() => {
          console.log('Redirección completada')
        }).catch(err => {
          console.error('Error en redirección:', err)
          error.value = 'Error al redirigir al dashboard'
        })
      }, 1500)
    } else {
      console.log('Respuesta no exitosa:', response.status, response.data)
      error.value = 'Error al iniciar sesión'
    }
  } catch (err) {
    console.error('Error en la solicitud:', err.response ? err.response.data : err.message)
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
}

.login-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  position: relative;
  z-index: 10;
  margin: var(--space-4);
}

/* Header Styles */
.login-header {
  background: var(--primary-gradient);
  padding: var(--space-8) var(--space-6) var(--space-6);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-bottom: var(--space-4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  position: relative;
}

.login-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.login-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: var(--space-2) 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.02em;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--text-lg);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.header-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

/* Form Styles */
.login-form {
  padding: var(--space-8) var(--space-6) var(--space-6);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.input-group {
  position: relative;
}

.modern-input {
  transition: all var(--duration-300) var(--ease-out);
}

.modern-input :deep(.v-field) {
  border-radius: var(--radius-lg);
  transition: all var(--duration-200) var(--ease-out);
}

.modern-input :deep(.v-field:hover) {
  box-shadow: var(--shadow-sm);
}

.modern-input :deep(.v-field--focused) {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-checkbox {
  font-weight: 500;
  color: var(--neutral-700);
}

.login-button-container {
  margin-top: var(--space-4);
}

.login-btn {
  height: 56px;
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all var(--duration-200) var(--ease-out);
  background: var(--primary-gradient);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-500) var(--ease-out);
}

.login-btn:hover::before {
  left: 100%;
}

/* Alert Styles */
.modern-alert {
  margin-top: var(--space-4);
  border: none;
  font-weight: 500;
}

.error-alert {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-left: 4px solid #EF4444;
}

.success-alert {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  border-left: 4px solid #10B981;
}

/* Footer Styles */
.login-footer {
  padding: var(--space-4) var(--space-6) var(--space-6);
  background: var(--neutral-50);
}

.footer-content {
  width: 100%;
  text-align: center;
}

.divider-container {
  display: flex;
  align-items: center;
  margin: var(--space-4) 0;
  gap: var(--space-4);
}

.divider-text {
  color: var(--neutral-400);
  font-weight: 500;
  font-size: var(--text-sm);
  white-space: nowrap;
}

.register-btn {
  margin: var(--space-2) 0;
  font-weight: 600;
  text-transform: none;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.footer-link {
  font-size: var(--text-xs);
  text-transform: none;
}

/* Background Elements */
.login-bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.1));
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

/* Animation Delays for Staggered Effects */
.slide-in-left {
  animation-delay: 0.1s;
}

.slide-in-right {
  animation-delay: 0.2s;
}

.slide-in-up {
  animation-delay: 0.3s;
}

/* Responsive Design */
@media (max-width: 640px) {
  .login-container {
    padding: var(--space-2);
  }

  .login-card {
    margin: var(--space-2);
    max-width: none;
  }

  .login-header {
    padding: var(--space-6) var(--space-4) var(--space-4);
  }

  .login-title {
    font-size: 2rem;
  }

  .login-subtitle {
    font-size: var(--text-base);
  }

  .login-form {
    padding: var(--space-6) var(--space-4) var(--space-4);
  }

  .footer-links {
    flex-direction: column;
    gap: var(--space-2);
  }

  .bg-circle {
    display: none;
  }
}

/* Focus States */
.login-btn:focus-visible {
  outline: 2px solid rgba(37, 211, 102, 0.5);
  outline-offset: 2px;
}

/* Loading State */
.login-btn.v-btn--loading {
  pointer-events: none;
}

.login-btn.v-btn--loading::before {
  display: none;
}
</style>