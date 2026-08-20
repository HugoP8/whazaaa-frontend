<template>
  <div class="reg-wrap">
    <div class="reg-card">

      <!-- Logo -->
      <div class="rc-logo-row">
        <div class="rc-logo">
          <v-icon size="26" color="white">mdi-account-plus</v-icon>
        </div>
        <div>
          <span class="rc-brand">Whazaaa</span>
          <span class="rc-tagline">Crea tu cuenta gratis</span>
        </div>
      </div>

      <h2 class="rc-title">Comenzar ahora</h2>
      <p class="rc-sub">Recibes 300 mensajes gratis en el plan inicial</p>

      <div class="rc-form">

        <!-- Nombre -->
        <div class="field-group">
          <label class="field-label">Nombre completo</label>
          <div class="field-wrap" :class="{ focused: focusName }">
            <v-icon size="18" :color="focusName ? '#25D366' : '#94a3b8'">mdi-account-outline</v-icon>
            <input
              v-model="form.name"
              type="text"
              placeholder="Tu nombre"
              class="field-input"
              @focus="focusName = true"
              @blur="focusName = false"
              autofocus
            />
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">Correo electrónico</label>
          <div class="field-wrap" :class="{ focused: focusEmail }">
            <v-icon size="18" :color="focusEmail ? '#25D366' : '#94a3b8'">mdi-email-outline</v-icon>
            <input
              v-model="form.email"
              type="email"
              placeholder="tu@correo.com"
              class="field-input"
              @focus="focusEmail = true"
              @blur="focusEmail = false"
            />
          </div>
        </div>

        <!-- Teléfono (opcional) -->
        <div class="field-group">
          <label class="field-label">
            Número de celular
            <span class="optional-badge">opcional — para iniciar sesión con tu teléfono</span>
          </label>
          <div class="field-wrap" :class="{ focused: focusPhone }">
            <v-icon size="18" :color="focusPhone ? '#25D366' : '#94a3b8'">mdi-phone-outline</v-icon>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+52 331 123 4567"
              class="field-input"
              @focus="focusPhone = true"
              @blur="focusPhone = false"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <div class="field-wrap" :class="{ focused: focusPwd }">
            <v-icon size="18" :color="focusPwd ? '#25D366' : '#94a3b8'">mdi-lock-outline</v-icon>
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              placeholder="Mínimo 6 caracteres"
              class="field-input"
              @focus="focusPwd = true"
              @blur="focusPwd = false"
            />
            <!-- Indicador de fortaleza -->
            <div class="pwd-dots">
              <span v-for="i in 4" :key="i" class="pwd-dot" :class="pwdLevel >= i ? `level-${pwdLevel}` : ''"></span>
            </div>
            <button type="button" class="field-eye" @click="showPwd = !showPwd" tabindex="-1">
              <v-icon size="17" color="#94a3b8">{{ showPwd ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </button>
          </div>
        </div>

        <!-- Confirmar contraseña -->
        <div class="field-group">
          <label class="field-label">Confirmar contraseña</label>
          <div class="field-wrap" :class="{ focused: focusConf, 'field-error': form.confirm && !pwdMatch }">
            <v-icon size="18" :color="focusConf ? '#25D366' : '#94a3b8'">mdi-lock-check-outline</v-icon>
            <input
              v-model="form.confirm"
              :type="showPwd ? 'text' : 'password'"
              placeholder="Repite tu contraseña"
              class="field-input"
              @focus="focusConf = true"
              @blur="focusConf = false"
              @keydown.enter="handleRegister"
            />
            <v-icon v-if="form.confirm && pwdMatch" size="16" color="#25D366">mdi-check-circle</v-icon>
          </div>
        </div>

        <!-- Términos -->
        <label class="terms-check">
          <input type="checkbox" v-model="acceptTerms" />
          <span class="check-box" :class="{ checked: acceptTerms }">
            <v-icon v-if="acceptTerms" size="13" color="white">mdi-check</v-icon>
          </span>
          Acepto los <a href="#" @click.prevent>términos de servicio</a> y <a href="#" @click.prevent>privacidad</a>
        </label>

        <!-- Error -->
        <transition name="err-fade">
          <div v-if="error" class="rc-error">
            <v-icon size="16" color="#ef4444">mdi-alert-circle</v-icon>
            {{ error }}
          </div>
        </transition>

        <!-- Botón -->
        <button
          class="rc-btn"
          :class="{ loading }"
          :disabled="loading || !canSubmit"
          @click="handleRegister"
        >
          <span v-if="!loading" class="rc-btn-inner">
            <v-icon size="18" color="white">mdi-rocket-launch-outline</v-icon>
            Crear mi cuenta
          </span>
          <span v-else class="rc-btn-inner">
            <v-progress-circular indeterminate size="18" width="2" color="white" />
            Creando cuenta...
          </span>
        </button>

      </div>

      <div class="rc-divider"><span>o</span></div>

      <button class="rc-back" @click="$router.push('/login')">
        <v-icon size="16">mdi-arrow-left</v-icon>
        Ya tengo cuenta, iniciar sesión
      </button>

    </div>

    <!-- Botón manual -->
    <button class="manual-big-btn" @click="$emit('open-manual')">
      <div class="mbtn-icon">
        <v-icon size="20" color="#25D366">mdi-book-open-page-variant-outline</v-icon>
      </div>
      <div class="mbtn-text">
        <span class="mbtn-title">Ver manual completo</span>
        <span class="mbtn-sub">Guía de uso, planes, FAQ y más</span>
      </div>
      <v-icon size="16" color="#94a3b8">mdi-chevron-right</v-icon>
    </button>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter }     from 'vue-router'
import { useStore }      from 'vuex'
import { useToast }      from 'vue-toastification'

const emit   = defineEmits(['open-manual'])
const store  = useStore()
const router = useRouter()
const toast  = useToast()

const showPwd     = ref(false)
const acceptTerms = ref(false)
const loading     = ref(false)
const error       = ref(null)

const focusName  = ref(false)
const focusEmail = ref(false)
const focusPhone = ref(false)
const focusPwd   = ref(false)
const focusConf  = ref(false)

const form = ref({ name: '', email: '', phone: '', password: '', confirm: '' })

const pwdMatch = computed(() => form.value.password === form.value.confirm)

const pwdLevel = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6)  score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++
  if (/[^a-zA-Z0-9]/.test(p)) score++
  return score
})

const canSubmit = computed(() =>
  form.value.name &&
  form.value.email &&
  form.value.password.length >= 6 &&
  pwdMatch.value &&
  acceptTerms.value
)

const handleRegister = async () => {
  if (!canSubmit.value) return

  loading.value = true
  error.value   = null

  try {
    await store.dispatch('auth/register', {
      name:     form.value.name,
      email:    form.value.email,
      phone:    form.value.phone || undefined,
      password: form.value.password,
    })
    toast.success('¡Cuenta creada! Bienvenido a Whazaaa 🎉')
    setTimeout(() => router.push('/dashboard'), 800)
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Error al crear la cuenta'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reg-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.reg-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 22px;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.06),
    0 4px 6px -1px rgba(0,0,0,0.07),
    0 12px 28px -4px rgba(0,0,0,0.1);
}

/* logo */
.rc-logo-row {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px;
}
.rc-logo {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(37,211,102,0.4);
  flex-shrink: 0;
}
.rc-brand   { display: block; font-size: 1.2rem; font-weight: 800; color: #0f172a; line-height: 1; }
.rc-tagline { display: block; font-size: 0.72rem; color: #94a3b8; }

.rc-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.rc-sub   { font-size: 0.83rem; color: #64748b; margin-bottom: 20px; }

/* form */
.rc-form { display: flex; flex-direction: column; gap: 14px; }

.field-group { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 0.8rem; font-weight: 600; color: #374151;
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
}
.optional-badge {
  font-size: 0.7rem; font-weight: 400; color: #94a3b8;
}

.field-wrap {
  display: flex; align-items: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 11px;
  padding: 0 12px;
  height: 46px;
  gap: 9px;
  transition: all 0.2s;
}
.field-wrap.focused {
  border-color: #25D366;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37,211,102,0.1);
}
.field-wrap.field-error { border-color: #f87171; }

.field-input {
  flex: 1; border: none; outline: none;
  background: transparent;
  font-size: 0.87rem; color: #0f172a; font-family: inherit;
}
.field-input::placeholder { color: #b0bec5; }

.field-eye {
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center;
}

/* Indicador de fortaleza de contraseña */
.pwd-dots { display: flex; gap: 3px; }
.pwd-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #e2e8f0; transition: background 0.2s;
}
.pwd-dot.level-1 { background: #f87171; }
.pwd-dot.level-2 { background: #fb923c; }
.pwd-dot.level-3 { background: #facc15; }
.pwd-dot.level-4 { background: #25D366; }

/* Términos */
.terms-check {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.8rem; color: #475569; cursor: pointer;
  user-select: none;
}
.terms-check input { display: none; }
.check-box {
  width: 18px; height: 18px; border-radius: 5px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.check-box.checked { background: #25D366; border-color: #25D366; }
.terms-check a { color: #25D366; font-weight: 600; text-decoration: none; }

/* Error */
.rc-error {
  display: flex; align-items: center; gap: 8px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 10px; padding: 10px 14px;
  font-size: 0.82rem; font-weight: 500; color: #dc2626;
}
.err-fade-enter-active, .err-fade-leave-active { transition: all 0.25s; }
.err-fade-enter-from, .err-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* Botón */
.rc-btn {
  width: 100%; height: 50px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(37,211,102,0.4);
  margin-top: 2px;
}
.rc-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,211,102,0.5); }
.rc-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.rc-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

/* divisor y botón volver */
.rc-divider {
  display: flex; align-items: center;
  margin: 16px 0 12px; gap: 12px;
  color: #cbd5e1; font-size: 0.78rem;
}
.rc-divider::before, .rc-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

.rc-back {
  width: 100%; height: 44px;
  border-radius: 11px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #374151;
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all 0.2s;
}
.rc-back:hover { border-color: #25D366; color: #25D366; }

/* botón manual */
.manual-big-btn {
  display: flex; align-items: center; gap: 14px;
  width: 100%; background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px; padding: 14px 18px;
  cursor: pointer; transition: all 0.22s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.manual-big-btn:hover {
  border-color: #25D366; background: #f0fdf4;
  box-shadow: 0 4px 16px rgba(37,211,102,0.15);
  transform: translateY(-1px);
}
.mbtn-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(37,211,102,0.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mbtn-text { flex: 1; text-align: left; display: flex; flex-direction: column; gap: 2px; }
.mbtn-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.mbtn-sub   { font-size: 0.75rem; color: #64748b; }
</style>
