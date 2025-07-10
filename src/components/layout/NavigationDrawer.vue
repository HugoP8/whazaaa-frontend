<template>
  <v-navigation-drawer
    v-model="localDrawer"
    app
    color="grey-lighten-4"
    width="280"
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
              {{ todayMessages }} / 300
            </div>
            <v-progress-linear
              :model-value="(todayMessages / 300) * 100"
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
import { computed } from 'vue'

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

// TODO: Obtener desde el store
const todayMessages = computed(() => 45)
</script>