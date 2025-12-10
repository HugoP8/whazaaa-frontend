<template>
  <v-navigation-drawer
    v-model="localDrawer"
    app
    color="grey-lighten-4"
    width="280"
    @click:outside="handleClickOutside"
    :temporary="$vuetify.display.mobile"
  >
    <!-- User Info & Membership Badge -->
    <div class="pa-4 pb-2">
      <v-card variant="outlined" rounded="xl" class="membership-card">
        <v-card-text class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <div class="flex-grow-1">
              <div class="text-caption text-grey mb-1">Plan Actual</div>
              <MembershipBadge
                :plan-name="currentPlanName"
                :display-name="currentPlanDisplay"
                size="small"
                variant="elevated"
                :show-icon="true"
                :elevated="true"
              />
            </div>
            <v-icon
              v-if="membershipExpiringSoon"
              color="warning"
              size="small"
              class="ml-2"
            >
              mdi-alert-circle
            </v-icon>
          </div>

          <!-- Days Remaining Alert (if expiring soon) -->
          <v-alert
            v-if="membershipExpiringSoon && daysRemaining !== null"
            type="warning"
            density="compact"
            variant="tonal"
            class="mt-2 text-caption"
          >
            Vence en {{ daysRemaining }} días
          </v-alert>
        </v-card-text>
      </v-card>
    </div>

    <v-divider class="mx-4 my-2"></v-divider>

    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :color="item.special ? 'purple-darken-2' : 'primary'"
        rounded="xl"
        :class="[
          'mx-2 my-1',
          item.special ? 'admin-menu-item' : ''
        ]"
      >
      </v-list-item>
    </v-list>
    
    <template v-slot:append>
      <div class="pa-4">
        <v-card
          color="primary"
          variant="tonal"
          class="text-center"
        >
          <v-card-text>
            <v-icon size="40">mdi-rocket-launch</v-icon>
            <div class="text-h6 mt-2">Mensajes hoy</div>
            <div class="text-h4 font-weight-bold">
              {{ todayMessages }} / {{ monthlyLimit }}
            </div>
            <v-progress-linear
              :model-value="messagesProgress"
              color="primary"
              height="8"
              rounded
              class="mt-2"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import MembershipBadge from '@/components/subscription/MembershipBadge.vue'

const store = useStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localDrawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const user = computed(() => store.getters['auth/user'])
const isAdmin = computed(() => {
  const admin = store.getters['auth/isAdmin']
  console.log('[NavigationDrawer] isAdmin:', admin)
  console.log('[NavigationDrawer] user:', user.value)
  console.log('[NavigationDrawer] user role:', user.value?.role)
  return admin
})

// Membership getters
const membership = computed(() => store.getters['auth/membership'])
const currentPlanDisplay = computed(() => store.getters['auth/currentPlan'])
const currentPlanName = computed(() => membership.value?.plan?.name || 'free')
const membershipExpiringSoon = computed(() => store.getters['auth/membershipExpiringSoon'])
const daysRemaining = computed(() => membership.value?.daysRemaining || null)

const menuItems = computed(() => {
  const baseItems = [
    {
      title: 'Dashboard',
      icon: 'mdi-view-dashboard',
      to: '/dashboard'
    },
    {
      title: 'Envío Masivo',
      icon: 'mdi-send-outline',
      to: '/messages'
    },
    {
      title: 'Nueva Campaña',
      icon: 'mdi-send',
      to: '/campaigns/new'
    },
    {
      title: 'Campañas',
      icon: 'mdi-email-multiple',
      to: '/campaigns'
    },
    {
      title: 'Contactos',
      icon: 'mdi-contacts',
      to: '/contacts'
    },
    {
      title: 'Mi Suscripción',
      icon: 'mdi-crown',
      to: '/subscription'
    },
    {
      title: 'Planes',
      icon: 'mdi-rocket-launch',
      to: '/pricing'
    },
    {
      title: 'Configuración',
      icon: 'mdi-cog',
      to: '/settings'
    }
  ]

  // Agregar enlace de admin si el usuario es admin
  console.log('[NavigationDrawer] Computing menuItems, isAdmin:', isAdmin.value)
  if (isAdmin.value) {
    console.log('[NavigationDrawer] Agregando enlace Panel Admin')
    baseItems.splice(baseItems.length - 1, 0, {
      title: 'Panel Admin',
      icon: 'mdi-shield-crown',
      to: '/admin',
      special: true
    })
  }

  console.log('[NavigationDrawer] menuItems final:', baseItems.length, 'items')
  return baseItems
})

// Obtener datos reales desde el store
const todayMessages = computed(() => store.getters['whatsapp/todayMessagesCount'])
const monthlyLimit = computed(() => store.getters['whatsapp/monthlyLimit'])
const messagesProgress = computed(() => store.getters['whatsapp/messagesProgress'])

// Función para cerrar el menú al hacer clic fuera
const handleClickOutside = () => {
  // En dispositivos móviles, cerrar el drawer automáticamente
  if (window.innerWidth < 1280) { // lg breakpoint de Vuetify
    localDrawer.value = false
  }
}

// Cargar estadísticas al montar el componente
onMounted(() => {
  store.dispatch('whatsapp/fetchTodayMessagesStats')
})
</script>

<style scoped>
/* Estilo especial para el enlace de Panel Admin */
.admin-menu-item {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  border-left: 4px solid #fbbf24 !important;
  margin-top: 12px !important;
  margin-bottom: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.3) !important;
}

.admin-menu-item:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%) !important;
  transform: translateX(4px);
  box-shadow: 0 6px 8px -1px rgba(124, 58, 237, 0.4) !important;
}

/* Asegurar que el ícono y texto sean blancos en el item admin */
.admin-menu-item :deep(.v-list-item__prepend),
.admin-menu-item :deep(.v-list-item-title) {
  color: white !important;
}

/* Animación suave */
.admin-menu-item {
  transition: all 0.3s ease;
}

/* Membership card */
.membership-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease;
}

.membership-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>