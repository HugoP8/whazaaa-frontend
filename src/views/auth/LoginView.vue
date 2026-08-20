<template>
  <div class="login-wrap">

    <!-- ═══════ CARD ═══════ -->
    <div class="login-card">

      <!-- Encabezado -->
      <div class="lh">
        <div class="lh-icon"><v-icon size="22" color="white">mdi-whatsapp</v-icon></div>
        <div class="lh-titles">
          <span class="lh-brand">Whazaaa</span>
          <span class="lh-sub">Inicia sesión en tu cuenta</span>
        </div>
      </div>

      <!-- Formulario -->
      <div class="lf">

        <!-- Identificador -->
        <div class="fg">
          <p class="fl">Email o número de celular</p>
          <div class="fi" :class="{ 'fi-active': fId, 'fi-filled': identifier }">
            <v-icon size="17" class="fi-ico" :color="fId ? '#22c55e' : '#9ca3af'">
              {{ looksLikePhone ? 'mdi-phone' : 'mdi-email' }}
            </v-icon>
            <input
              ref="idRef"
              v-model="identifier"
              type="text"
              placeholder="tu@correo.com o +52 331..."
              class="fi-input"
              autocomplete="username"
              @focus="fId = true"
              @blur="fId = false"
              @keydown.enter="$refs.pwdRef.focus()"
            />
            <span v-if="identifier" class="fi-badge">{{ looksLikePhone ? 'Celular' : 'Email' }}</span>
          </div>
        </div>

        <!-- Contraseña -->
        <div class="fg">
          <p class="fl">Contraseña</p>
          <div class="fi" :class="{ 'fi-active': fPwd, 'fi-filled': pwd }">
            <v-icon size="17" class="fi-ico" :color="fPwd ? '#22c55e' : '#9ca3af'">mdi-lock</v-icon>
            <input
              ref="pwdRef"
              v-model="pwd"
              :type="showPwd ? 'text' : 'password'"
              placeholder="••••••••"
              class="fi-input"
              autocomplete="current-password"
              @focus="fPwd = true"
              @blur="fPwd = false"
              @keydown.enter="doLogin"
            />
            <span class="fi-eye" @click="showPwd = !showPwd">
              <v-icon size="17" color="#9ca3af">{{ showPwd ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </span>
          </div>
        </div>

        <!-- Alerta error -->
        <Transition name="err">
          <div v-if="errorMsg" class="lerr">
            <v-icon size="15" color="#ef4444">mdi-alert-circle</v-icon>
            {{ errorMsg }}
          </div>
        </Transition>

        <!-- Botón -->
        <div
          class="lbtn"
          :class="{ 'lbtn-loading': loading, 'lbtn-disabled': !canLogin }"
          @click="doLogin"
        >
          <template v-if="!loading">
            <v-icon size="18" color="white">mdi-login-variant</v-icon>
            <span>Iniciar Sesión</span>
          </template>
          <template v-else>
            <v-progress-circular indeterminate size="18" width="2" color="white" />
            <span>Verificando...</span>
          </template>
        </div>

      </div>

      <!-- Footer card -->
      <div class="lcard-footer">
        <div class="ldiv"><span>o</span></div>
        <div
          class="lbtn-sec"
          @click="$router.push('/register')"
        >
          <v-icon size="16">mdi-account-plus</v-icon>
          <span>Crear cuenta nueva · es gratis</span>
        </div>
        <a :href="waLink" target="_blank" class="ldemo">
          <v-icon size="14" color="#22c55e">mdi-gift</v-icon>
          Solicitar 3 créditos demo gratis
        </a>
      </div>

    </div>

    <!-- ═══════ BOTÓN MANUAL ═══════ -->
    <div class="manual-btn" @click="$emit('open-manual')">
      <div class="mb-icon">
        <v-icon size="22" color="#22c55e">mdi-book-open-page-variant</v-icon>
      </div>
      <div class="mb-body">
        <span class="mb-title">Ver manual completo</span>
        <span class="mb-desc">Guía paso a paso, planes y preguntas frecuentes</span>
      </div>
      <v-icon size="18" color="#d1d5db">mdi-chevron-right</v-icon>
    </div>

    <!-- Overlay éxito -->
    <Transition name="pop">
      <div v-if="showOk" class="ok-overlay">
        <div class="ok-box">
          <div class="ok-circle"><v-icon size="36" color="white">mdi-check-bold</v-icon></div>
          <p class="ok-title">¡Bienvenido!</p>
          <p class="ok-sub">Cargando el dashboard...</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore }  from 'vuex'
import { useToast }  from 'vue-toastification'

defineEmits(['open-manual'])

const router = useRouter()
const store  = useStore()
const toast  = useToast()

const identifier = ref('')
const pwd        = ref('')
const showPwd    = ref(false)
const fId        = ref(false)
const fPwd       = ref(false)
const loading    = ref(false)
const errorMsg   = ref('')
const showOk     = ref(false)

const idRef  = ref(null)
const pwdRef = ref(null)

const SALES_WA = import.meta.env.VITE_SALES_WA || '5491112345678'
const waLink = computed(() => {
  const m = encodeURIComponent('Hola, quiero una cuenta demo de Whazaaa con 3 créditos gratuitos 🎁')
  return `https://wa.me/${SALES_WA}?text=${m}`
})

const looksLikePhone = computed(() => {
  const v = identifier.value.replace(/[\s\+\-\(\)]/g, '')
  return /^\d{7,}$/.test(v) && !identifier.value.includes('@')
})

const canLogin = computed(() => identifier.value.trim() && pwd.value.trim())

const doLogin = async () => {
  if (!canLogin.value || loading.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    await store.dispatch('auth/login', {
      identifier: identifier.value.trim(),
      email:      identifier.value.trim(),
      password:   pwd.value,
    })
    showOk.value = true
    setTimeout(() => {
      if (router.currentRoute.value.path !== '/dashboard') router.push('/dashboard')
    }, 1200)
  } catch (e) {
    errorMsg.value = e.response?.data?.error || e.response?.data?.message || e.message || 'Credenciales incorrectas'
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── reset global para botones ── */
* { box-sizing: border-box; }
button, [role="button"] {
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  outline: none !important;
  border: none;
  cursor: pointer;
  user-select: none;
}

.login-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

/* ── CARD ── */
.login-card {
  background: #fff;
  border-radius: 22px;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.05),
    0 2px 4px rgba(0,0,0,0.04),
    0 8px 24px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* encabezado */
.lh {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 28px 20px;
  background: linear-gradient(135deg, #16a34a 0%, #0f766e 100%);
}
.lh-icon {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lh-titles { display: flex; flex-direction: column; gap: 2px; }
.lh-brand { font-size: 1.15rem; font-weight: 800; color: #fff; line-height: 1; }
.lh-sub   { font-size: 0.78rem; color: rgba(255,255,255,0.75); }

/* formulario */
.lf {
  padding: 24px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* field group */
.fg { display: flex; flex-direction: column; gap: 6px; }

.fl {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.fi {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  padding: 0 14px;
  height: 48px;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
.fi-active {
  border-color: #22c55e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
}
.fi-filled { background: #fff; border-color: #d1d5db; }

.fi-ico { flex-shrink: 0; transition: color 0.18s; }

.fi-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.92rem;
  color: #111827;
  font-family: inherit;
  min-width: 0;
}
.fi-input::placeholder { color: #d1d5db; }

.fi-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #16a34a;
  background: rgba(34,197,94,0.1);
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.fi-eye {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.15s;
}
.fi-eye:hover { background: #f3f4f6; }

/* error */
.lerr {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #b91c1c;
  font-weight: 500;
}
.err-enter-active, .err-leave-active { transition: all .22s; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-4px); }

/* botón principal */
.lbtn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22c55e 0%, #0f766e 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(34,197,94,0.35);
  transition: box-shadow 0.18s, transform 0.18s, opacity 0.18s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.lbtn:hover { box-shadow: 0 8px 24px rgba(34,197,94,0.45); transform: translateY(-1px); }
.lbtn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(34,197,94,0.3); }
.lbtn-disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.lbtn-loading { opacity: 0.8; cursor: wait; }

/* footer de la card */
.lcard-footer {
  padding: 0 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.ldiv {
  display: flex; align-items: center;
  width: 100%; gap: 12px;
  color: #e5e7eb; font-size: 0.78rem;
}
.ldiv::before, .ldiv::after {
  content: ''; flex: 1; height: 1px; background: #f3f4f6;
}
.ldiv span { color: #9ca3af; }

.lbtn-sec {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 44px;
  border-radius: 11px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.lbtn-sec:hover { border-color: #22c55e; color: #16a34a; background: #f0fdf4; }
.lbtn-sec:active { background: #dcfce7; }

.ldemo {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #16a34a;
  text-decoration: none;
}
.ldemo:hover { text-decoration: underline; }

/* ── BOTÓN MANUAL ── */
.manual-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  background: #fff;
  border-radius: 18px;
  border: 1.5px solid #e5e7eb;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.manual-btn:hover {
  border-color: #22c55e;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34,197,94,0.12);
}
.manual-btn:active { transform: translateY(0); }

.mb-icon {
  width: 44px; height: 44px;
  background: rgba(34,197,94,0.1);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mb-body { flex: 1; text-align: left; display: flex; flex-direction: column; gap: 3px; }
.mb-title { font-size: 0.92rem; font-weight: 700; color: #111827; }
.mb-desc  { font-size: 0.75rem; color: #6b7280; }

/* ── OVERLAY OK ── */
.ok-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.ok-box {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  text-align: center;
}
.ok-circle {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #22c55e, #0f766e);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 40px rgba(34,197,94,0.5);
  animation: pop .4s cubic-bezier(.175,.885,.32,1.275);
}
@keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.ok-title { font-size: 1.5rem; font-weight: 800; color: #fff; }
.ok-sub   { font-size: 0.9rem; color: rgba(255,255,255,0.65); }

.pop-enter-active { transition: opacity .3s; }
.pop-leave-active { transition: opacity .3s; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
</style>
