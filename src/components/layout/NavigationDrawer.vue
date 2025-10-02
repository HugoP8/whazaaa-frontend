<template>
  <v-navigation-drawer
    v-model="localDrawer"
    app
    color="grey-lighten-4"
    width="280"
    @click:outside="handleClickOutside"
    :temporary="$vuetify.display.mobile"
  >
    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        color="primary"
        rounded="xl"
        class="mx-2 my-1"
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

const menuItems = [
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
    title: 'Configuración',
    icon: 'mdi-cog',
    to: '/settings'
  }
]

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