<template>
  <v-app>
    <div class="auth-root">

      <!-- ═══════════════════════════════════════════
           PANEL IZQUIERDO — showcase visual
           ═══════════════════════════════════════════ -->
      <div class="showcase-panel">
        <!-- Orbes de fondo -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <div class="showcase-content">

          <!-- Marca -->
          <div class="brand">
            <div class="brand-icon">
              <v-icon size="24" color="white">mdi-whatsapp</v-icon>
            </div>
            <span class="brand-name">Whazaaa</span>
          </div>

          <!-- Headline -->
          <h1 class="headline">
            Envía campañas de<br>
            <span class="headline-green">WhatsApp a escala</span>
          </h1>
          <p class="headline-sub">
            Conecta tu número, importa contactos o grupos y envía miles
            de mensajes con seguimiento en tiempo real.
          </p>

          <!-- Mockup de la app (CSS puro) -->
          <div class="app-mockup">
            <div class="mockup-bar">
              <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
              <span class="mockup-bar-title">Whazaaa · Dashboard</span>
            </div>
            <div class="mockup-body">
              <!-- Stat cards -->
              <div class="mockup-stats">
                <div class="mstat green">
                  <div class="mstat-val">2,847</div>
                  <div class="mstat-lbl">Enviados hoy</div>
                </div>
                <div class="mstat blue">
                  <div class="mstat-val">12</div>
                  <div class="mstat-lbl">Campañas activas</div>
                </div>
                <div class="mstat purple">
                  <div class="mstat-val">98.4%</div>
                  <div class="mstat-lbl">Entregados</div>
                </div>
              </div>
              <!-- Barra de progreso de campaña -->
              <div class="mockup-campaign">
                <div class="mc-header">
                  <span class="mc-name">Campaña Verano 2026</span>
                  <span class="mc-badge">EN PROGRESO</span>
                </div>
                <div class="mc-bar-wrap">
                  <div class="mc-bar" style="width: 72%"></div>
                </div>
                <div class="mc-meta">1,440 / 2,000 mensajes · 72%</div>
              </div>
              <!-- Rows de mensajes recientes -->
              <div class="mockup-msgs">
                <div class="mm-row" v-for="m in mockMsgs" :key="m.phone">
                  <div class="mm-avatar"></div>
                  <div class="mm-info">
                    <span class="mm-phone">{{ m.phone }}</span>
                    <span class="mm-txt">{{ m.txt }}</span>
                  </div>
                  <span class="mm-status" :class="m.ok ? 'ok' : 'fail'">
                    {{ m.ok ? '✓✓' : '✗' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature bullets reales -->
          <ul class="features">
            <li v-for="f in realFeatures" :key="f">
              <span class="feat-check">✓</span>
              {{ f }}
            </li>
          </ul>

          <!-- Planes compactos -->
          <div class="mini-plans">
            <div
              v-for="p in miniPlans"
              :key="p.name"
              class="mini-plan"
              :class="{ 'mini-plan-hot': p.hot }"
            >
              <div class="mp-name">{{ p.name }}</div>
              <div class="mp-price">{{ p.price }}</div>
              <div class="mp-detail">{{ p.detail }}</div>
            </div>
          </div>

          <!-- CTA Demo -->
          <a :href="waLink" target="_blank" class="cta-demo">
            <v-icon size="18" color="white">mdi-whatsapp</v-icon>
            Solicitar 3 créditos gratis
          </a>

          <!-- Botón manual -->
          <button class="manual-btn" @click="showManual = true">
            <v-icon size="14">mdi-book-open-outline</v-icon>
            Ver manual completo
          </button>

        </div>
      </div>

      <!-- ═══════════════════════════════════════════
           PANEL DERECHO — formulario
           ═══════════════════════════════════════════ -->
      <div class="form-panel">
        <div class="form-inner">
          <transition name="slide-x" mode="out-in">
            <router-view @open-manual="showManual = true" />
          </transition>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════
         MODAL — Manual completo
         ═══════════════════════════════════════════ -->
    <v-dialog v-model="showManual" max-width="780" scrollable>
      <v-card rounded="xl" class="manual-card">
        <v-card-title class="manual-header">
          <div class="manual-title-row">
            <div class="brand-icon small">
              <v-icon size="18" color="white">mdi-whatsapp</v-icon>
            </div>
            <span>Manual de uso — Whazaaa</span>
          </div>
          <v-btn icon variant="text" @click="showManual = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="manual-body">

          <!-- Flujo ideal -->
          <h3 class="man-section">¿Cómo funciona paso a paso?</h3>
          <div class="man-steps">
            <div class="man-step" v-for="(s, i) in manualSteps" :key="i">
              <div class="man-step-num">{{ i + 1 }}</div>
              <div>
                <div class="man-step-title">{{ s.title }}</div>
                <div class="man-step-desc">{{ s.desc }}</div>
              </div>
            </div>
          </div>

          <!-- Flujos ideales -->
          <h3 class="man-section">Flujos recomendados</h3>
          <div class="man-flow" v-for="f in manualFlows" :key="f.title">
            <div class="mf-title">
              <v-icon size="16" color="primary">{{ f.icon }}</v-icon>
              {{ f.title }}
            </div>
            <div class="mf-desc">{{ f.desc }}</div>
            <div class="mf-steps">
              <span v-for="(step, i) in f.steps" :key="i" class="mf-step">
                {{ step }}<v-icon v-if="i < f.steps.length - 1" size="12">mdi-chevron-right</v-icon>
              </span>
            </div>
          </div>

          <!-- Planes detallados -->
          <h3 class="man-section">Planes disponibles</h3>
          <v-table density="comfortable" class="man-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Precio</th>
                <th>Mensajes/mes</th>
                <th>Números WA</th>
                <th>Campañas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in detailedPlans" :key="p.name">
                <td><strong>{{ p.name }}</strong></td>
                <td>{{ p.price }}</td>
                <td>{{ p.msgs }}</td>
                <td>{{ p.nums }}</td>
                <td>{{ p.campaigns }}</td>
              </tr>
            </tbody>
          </v-table>

          <!-- FAQ -->
          <h3 class="man-section">Preguntas frecuentes</h3>
          <v-expansion-panels variant="accordion" class="man-faq">
            <v-expansion-panel v-for="(faq, i) in faqs" :key="i" rounded="lg">
              <v-expansion-panel-title class="faq-q-text">{{ faq.q }}</v-expansion-panel-title>
              <v-expansion-panel-text class="faq-a-text">{{ faq.a }}</v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- CTA demo en el manual -->
          <div class="man-cta">
            <p>¿Listo para probar? Escríbenos y te activamos una cuenta demo gratis.</p>
            <a :href="waLink" target="_blank" class="cta-demo inline">
              <v-icon size="18" color="white">mdi-whatsapp</v-icon>
              Quiero mi cuenta demo
            </a>
          </div>

        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'

const showManual = ref(false)

const SALES_WA = import.meta.env.VITE_SALES_WA || '5491112345678'
const waLink = computed(() => {
  const msg = encodeURIComponent('Hola, quiero una cuenta demo de Whazaaa con 3 créditos gratuitos 🎁')
  return `https://wa.me/${SALES_WA}?text=${msg}`
})

// Datos del mockup visual
const mockMsgs = [
  { phone: '+52 331 4XX XXXX', txt: '¡Hola! Tu pedido está listo...', ok: true },
  { phone: '+52 449 8XX XXXX', txt: 'Aprovecha nuestra promo...', ok: true },
  { phone: '+52 33 3XX XXXX',  txt: 'Te recordamos tu cita...', ok: false },
]

// Features REALES del sistema (verificadas en el código)
const realFeatures = [
  'Campañas masivas a contactos individuales',
  'Envío a grupos de WhatsApp',
  'Progreso en tiempo real vía Socket.IO',
  'Soporte de imágenes, video y documentos',
  'Múltiples números por cuenta (según plan)',
  'Sistema de créditos y suscripciones',
  'Panel de administración completo',
]

// Planes según la BD real (subscription_plans)
const miniPlans = [
  { name: 'Demo',     price: 'Gratis',   detail: '3 créditos · 1 número',    hot: false },
  { name: 'Pro',      price: '$29/mes',  detail: '3,000 msg · 2 números',    hot: true  },
  { name: 'Business', price: '$79/mes',  detail: '15,000 msg · 5 números',   hot: false },
]

// Manual - pasos
const manualSteps = [
  {
    title: 'Crea tu cuenta',
    desc: 'Regístrate con tu correo. Si tienes una cuenta demo, usa las credenciales que te enviamos.'
  },
  {
    title: 'Conecta tu WhatsApp',
    desc: 'En el Dashboard verás un QR. Ábrelo con WhatsApp en tu teléfono: Ajustes → Dispositivos vinculados → Vincular dispositivo. La sesión se guarda y se reconecta automáticamente.'
  },
  {
    title: 'Crea una campaña',
    desc: 'Ve a "Nueva Campaña". Elige si enviarás a contactos individuales o a grupos. Escribe tu mensaje (opcional: agrega imagen, video o documento).'
  },
  {
    title: 'Selecciona destinatarios',
    desc: 'Para contactos: pega números o sube un CSV. Para grupos: selecciona de la lista de grupos en los que está tu WhatsApp.'
  },
  {
    title: 'Configura el delay y lanza',
    desc: 'El delay entre mensajes (mínimo recomendado: 3 segundos) reduce el riesgo de bloqueo. Presiona "Enviar campaña" y monitorea el progreso en tiempo real.'
  },
  {
    title: 'Revisa el historial',
    desc: 'En "Campañas" puedes ver el estado de cada envío: enviados, fallidos, porcentaje de éxito y duración. Puedes reusar o cancelar campañas activas.'
  },
]

// Flujos recomendados
const manualFlows = [
  {
    icon: 'mdi-account-group',
    title: 'Envío masivo a contactos',
    desc: 'Ideal para listas de clientes, leads o suscriptores.',
    steps: ['Nueva Campaña', 'Tipo: Contactos', 'Pega números o sube CSV', 'Redacta mensaje', 'Lanzar'],
  },
  {
    icon: 'mdi-chat-plus',
    title: 'Difusión a grupos',
    desc: 'Envía a todos tus grupos de WhatsApp con un solo click.',
    steps: ['Nueva Campaña', 'Tipo: Grupos', 'Selecciona grupos', 'Redacta mensaje', 'Lanzar'],
  },
  {
    icon: 'mdi-image-plus',
    title: 'Campaña con multimedia',
    desc: 'Agrega imagen o video a tu mensaje para mayor impacto.',
    steps: ['Nueva Campaña', 'Sube imagen/video', 'Agrega caption', 'Selecciona destinatarios', 'Lanzar'],
  },
]

// Planes detallados (reflejan la BD real)
const detailedPlans = [
  { name: 'Demo / Free', price: 'Gratis',   msgs: '300/mes',    nums: '1',  campaigns: 'Ilimitadas' },
  { name: 'Pro',         price: '$29/mes',  msgs: '3,000/mes',  nums: '2',  campaigns: 'Ilimitadas' },
  { name: 'Business',    price: '$79/mes',  msgs: '15,000/mes', nums: '5',  campaigns: 'Ilimitadas' },
]

// FAQ precisas
const faqs = [
  {
    q: '¿Puedo perder mi número de WhatsApp?',
    a: 'Existe un riesgo real si se usa de forma abusiva. Recomendamos delays mínimos de 3 segundos entre mensajes, no enviar más de 200/hora y solo enviar a contactos que te conocen. El sistema no garantiza protección ante uso abusivo.',
  },
  {
    q: '¿Cómo funciona la cuenta demo?',
    a: 'Escríbenos por WhatsApp, te creamos la cuenta en minutos con 3 créditos. Cada crédito es 1 mensaje enviado. No se requiere tarjeta de crédito.',
  },
  {
    q: '¿Qué es el delay entre mensajes?',
    a: 'Es el tiempo de espera entre cada mensaje enviado. Un delay menor acelera el envío pero aumenta el riesgo de ban. Recomendamos mínimo 3 segundos para uso normal.',
  },
  {
    q: '¿Puedo conectar más de un número?',
    a: 'Sí. El plan Pro permite 2 números simultáneos, Business hasta 5. Cada número tiene su propia sesión de Baileys y se vincula a tu cuenta permanentemente (se puede cambiar desvinculando).',
  },
  {
    q: '¿Qué pasa si cierro el navegador?',
    a: 'La sesión de WhatsApp vive en el servidor, no en el navegador. Si cierras, las campañas en progreso continúan. Al volver, el estado se sincroniza automáticamente.',
  },
  {
    q: '¿Qué tipos de mensajes puedo enviar?',
    a: 'Texto plano, imágenes (JPG/PNG), videos (MP4) y documentos (PDF, Word). El caption del archivo es el texto del mensaje. Los mensajes de voz no están soportados aún.',
  },
  {
    q: '¿Puedo cancelar una campaña en curso?',
    a: 'Sí. En la vista de Campañas puedes cancelar cualquier campaña activa. Se detendrá en el siguiente mensaje programado. Los mensajes ya enviados no se pueden revertir.',
  },
  {
    q: '¿Qué diferencia hay entre contactos y grupos?',
    a: 'Contactos: el sistema envía un mensaje individual a cada número (conversación directa). Grupos: el sistema envía un mensaje al chat del grupo (todos los miembros lo ven juntos).',
  },
]
</script>

<style scoped>
/* ─── ROOT ──────────────────────────────────────────── */
.auth-root {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* ─── PANEL IZQUIERDO ───────────────────────────────── */
.showcase-panel {
  flex: 1 1 55%;
  background: linear-gradient(150deg, #0a2e1a 0%, #0f172a 50%, #1a0a2e 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  padding: 0;
}

/* orbes de fondo */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.orb-1 { width: 400px; height: 400px; background: rgba(37,211,102,0.12); top: -100px; left: -100px; }
.orb-2 { width: 300px; height: 300px; background: rgba(59,130,246,0.08); bottom: 50px; right: -80px; }
.orb-3 { width: 250px; height: 250px; background: rgba(139,92,246,0.07); top: 50%; left: 40%; }

.showcase-content {
  position: relative;
  z-index: 2;
  padding: 40px 44px 48px;
  width: 100%;
  max-width: 620px;
  overflow-y: auto;
  max-height: 100vh;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

/* marca */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}
.brand-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(37,211,102,0.4);
}
.brand-icon.small { width: 32px; height: 32px; border-radius: 8px; }
.brand-name { font-size: 1.3rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }

/* headline */
.headline {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 14px;
}
.headline-green {
  background: linear-gradient(90deg, #25D366, #6ee7b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.headline-sub {
  color: rgba(255,255,255,0.55);
  font-size: 1rem;
  line-height: 1.65;
  margin-bottom: 28px;
  max-width: 480px;
}

/* ─── MOCKUP CSS ──────────────────────────────────────── */
.app-mockup {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.mockup-bar {
  background: rgba(255,255,255,0.06);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.dot {
  width: 10px; height: 10px; border-radius: 50%; display: inline-block;
}
.dot.r { background: #ff5f57; }
.dot.y { background: #febc2e; }
.dot.g { background: #28c840; }
.mockup-bar-title {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  margin-left: 10px;
  font-family: monospace;
}
.mockup-body { padding: 14px; }

/* stats del mockup */
.mockup-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.mstat {
  padding: 10px 12px;
  border-radius: 10px;
  text-align: center;
}
.mstat.green { background: rgba(37,211,102,0.15); border: 1px solid rgba(37,211,102,0.2); }
.mstat.blue  { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); }
.mstat.purple{ background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.2); }
.mstat-val { font-size: 1.1rem; font-weight: 700; color: #fff; }
.mstat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.45); margin-top: 2px; }

/* campaña del mockup */
.mockup-campaign {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.mc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.mc-name { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.8); }
.mc-badge {
  font-size: 0.6rem; font-weight: 700;
  background: rgba(37,211,102,0.2); color: #25D366;
  padding: 2px 8px; border-radius: 20px;
}
.mc-bar-wrap {
  height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; margin-bottom: 6px;
}
.mc-bar {
  height: 100%; background: linear-gradient(90deg, #25D366, #128C7E);
  border-radius: 3px;
  animation: barGrow 2s ease-out;
}
@keyframes barGrow { from { width: 0 } }
.mc-meta { font-size: 0.65rem; color: rgba(255,255,255,0.35); }

/* mensajes del mockup */
.mockup-msgs { display: flex; flex-direction: column; gap: 6px; }
.mm-row {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}
.mm-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, #25D366, #128C7E);
  flex-shrink: 0;
}
.mm-info { flex: 1; overflow: hidden; }
.mm-phone { display: block; font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.7); }
.mm-txt   { font-size: 0.65rem; color: rgba(255,255,255,0.35); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-status { font-size: 0.75rem; font-weight: 700; }
.mm-status.ok   { color: #25D366; }
.mm-status.fail { color: #f87171; }

/* ─── FEATURES BULLETS ─────────────────────────────── */
.features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.7);
}
.feat-check {
  width: 20px; height: 20px;
  background: rgba(37,211,102,0.2);
  border: 1px solid rgba(37,211,102,0.4);
  color: #25D366;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800;
  flex-shrink: 0;
}

/* ─── MINI PLANES ───────────────────────────────────── */
.mini-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.mini-plan {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
  transition: border-color 0.2s;
}
.mini-plan:hover { border-color: rgba(37,211,102,0.3); }
.mini-plan-hot {
  background: rgba(37,211,102,0.1);
  border-color: rgba(37,211,102,0.35);
}
.mp-name { font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
.mp-price { font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.mp-detail { font-size: 0.68rem; color: rgba(255,255,255,0.4); line-height: 1.4; }

/* reset buttons en showcase */
.showcase-content button,
.showcase-content [role="button"] {
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  cursor: pointer;
}

/* ─── CTAs ──────────────────────────────────────────── */
.cta-demo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 12px 22px;
  border-radius: 10px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(37,211,102,0.4);
  transition: all 0.2s;
  margin-bottom: 14px;
  display: inline-flex;
}
.cta-demo:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,211,102,0.5); }
.cta-demo.inline { font-size: 0.95rem; padding: 13px 24px; }

.manual-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.manual-btn:hover { color: rgba(255,255,255,0.8); }

/* ─── PANEL DERECHO ─────────────────────────────────── */
.form-panel {
  width: 420px;
  min-width: 420px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 28px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
.form-inner {
  width: 100%;
  max-width: 380px;
}

/* transición formulario */
.slide-x-enter-active, .slide-x-leave-active { transition: all 0.28s cubic-bezier(0.4,0,0.2,1); }
.slide-x-enter-from { opacity: 0; transform: translateX(16px); }
.slide-x-leave-to   { opacity: 0; transform: translateX(-16px); }

/* ─── MODAL MANUAL ──────────────────────────────────── */
.manual-card { background: #fff; }
.manual-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}
.manual-title-row {
  display: flex; align-items: center; gap: 12px;
  font-size: 1.05rem; font-weight: 700; color: #0f172a;
}
.manual-body { padding: 24px; }

.man-section {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  border-left: 3px solid #25D366;
  padding-left: 10px;
  margin: 28px 0 16px;
}
.man-section:first-child { margin-top: 0; }

.man-steps { display: flex; flex-direction: column; gap: 14px; }
.man-step {
  display: flex; gap: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
}
.man-step-num {
  width: 28px; height: 28px; min-width: 28px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
}
.man-step-title { font-size: 0.9rem; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
.man-step-desc  { font-size: 0.82rem; color: #64748b; line-height: 1.6; }

.man-flow {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
}
.mf-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.88rem; font-weight: 700; color: #0f172a;
  margin-bottom: 6px;
}
.mf-desc { font-size: 0.82rem; color: #64748b; margin-bottom: 10px; }
.mf-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.mf-step {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.75rem;
  background: rgba(37,211,102,0.1);
  color: #128C7E;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.man-table {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-bottom: 8px;
}

.man-faq { gap: 6px; display: flex; flex-direction: column; }
.faq-q-text { font-size: 0.88rem; font-weight: 600; }
.faq-a-text { font-size: 0.83rem; color: #475569; line-height: 1.7; }

.man-cta {
  margin-top: 28px;
  text-align: center;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 24px;
}
.man-cta p { color: #166534; font-weight: 600; margin-bottom: 14px; }

/* ─── RESPONSIVE ────────────────────────────────────── */
@media (max-width: 1100px) {
  .showcase-content { padding: 32px 32px 40px; }
  .headline { font-size: 1.9rem; }
}

@media (max-width: 900px) {
  .mini-plans { grid-template-columns: repeat(3, 1fr); }
  .mockup-stats { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .auth-root { flex-direction: column; }
  .showcase-panel {
    min-height: auto;
    order: 2;
  }
  .showcase-content { max-height: none; padding: 28px 20px 40px; }
  .form-panel {
    width: 100%; min-width: 0;
    height: auto; min-height: 100vh;
    position: relative;
    order: 1;
    padding: 24px 16px;
  }
  .headline { font-size: 1.6rem; }
  .mini-plans { grid-template-columns: repeat(3, 1fr); gap: 8px; }
}

@media (max-width: 480px) {
  .mini-plans { grid-template-columns: 1fr; }
  .mockup-stats { grid-template-columns: repeat(3, 1fr); }
  .headline { font-size: 1.4rem; }
}
</style>
