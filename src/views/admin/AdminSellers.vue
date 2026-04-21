<template>
  <div class="admin-sellers">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <h1 class="text-h4 font-weight-bold">
            <v-icon class="mr-2">mdi-account-tie</v-icon>
            Gestión de Vendedores
          </h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showCreateDialog = true"
          >
            Nuevo Vendedor
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Estadísticas -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-4">
            <v-icon color="primary" size="40" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h5 font-weight-bold">{{ sellers.length }}</div>
            <div class="text-caption text-grey">Total Vendedores</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-4">
            <v-icon color="success" size="40" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ activeSellers }}</div>
            <div class="text-caption text-grey">Activos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-4">
            <v-icon color="warning" size="40" class="mb-2">mdi-pause-circle</v-icon>
            <div class="text-h5 font-weight-bold">{{ inactiveSellers }}</div>
            <div class="text-caption text-grey">Inactivos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="2" rounded="xl">
          <v-card-text class="text-center pa-4">
            <v-icon color="info" size="40" class="mb-2">mdi-cash-multiple</v-icon>
            <div class="text-h5 font-weight-bold">{{ totalRecharges }}</div>
            <div class="text-caption text-grey">Recargas Procesadas</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de vendedores -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            <v-text-field
              v-model="search"
              label="Buscar vendedor"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-text-field>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-data-table
              :headers="headers"
              :items="filteredSellers"
              :loading="loading"
              :items-per-page="10"
              class="elevation-0"
            >
              <!-- Nombre -->
              <template v-slot:item.name="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar color="primary" size="40" class="mr-3">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div class="text-caption text-grey">{{ item.email }}</div>
                  </div>
                </div>
              </template>

              <!-- WhatsApp -->
              <template v-slot:item.whatsapp_number="{ item }">
                <v-chip
                  size="small"
                  prepend-icon="mdi-whatsapp"
                  color="success"
                  variant="tonal"
                >
                  {{ item.whatsapp_number }}
                </v-chip>
              </template>

              <!-- Estado -->
              <template v-slot:item.is_active="{ item }">
                <v-chip
                  :color="item.is_active ? 'success' : 'error'"
                  size="small"
                >
                  {{ item.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </template>

              <!-- Prioridad -->
              <template v-slot:item.priority="{ item }">
                <v-rating
                  :model-value="item.priority"
                  density="compact"
                  size="small"
                  readonly
                  color="orange"
                ></v-rating>
              </template>

              <!-- Recargas -->
              <template v-slot:item.recharges_count="{ item }">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold">{{ item.recharges_count || 0 }}</div>
                  <div class="text-caption text-grey">recargas</div>
                </div>
              </template>

              <!-- Acciones -->
              <template v-slot:item.actions="{ item }">
                <v-tooltip text="Editar">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="handleEdit(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip text="Eliminar">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="handleDelete(item)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </template>

              <!-- Loading -->
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
              </template>

              <!-- No data -->
              <template v-slot:no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
                  <p class="text-h6 text-grey mt-4">No hay vendedores registrados</p>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    class="mt-2"
                    @click="showCreateDialog = true"
                  >
                    Crear Primer Vendedor
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Crear/Editar -->
    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-6 bg-gradient-admin">
          <v-icon class="mr-2">{{ editingItem ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingItem ? 'Editar Vendedor' : 'Nuevo Vendedor' }}
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="formRef">
            <v-text-field
              v-model="formData.name"
              label="Nombre"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.whatsapp_number"
              label="Número WhatsApp"
              prepend-inner-icon="mdi-whatsapp"
              variant="outlined"
              :rules="[rules.required, rules.phone]"
              hint="Formato: +591XXXXXXXXX"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              label="Email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              :rules="[rules.email]"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.phone"
              label="Teléfono (opcional)"
              prepend-inner-icon="mdi-phone"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Descripción"
              prepend-inner-icon="mdi-text"
              variant="outlined"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-select
              v-model="formData.priority"
              label="Prioridad"
              :items="[1, 2, 3, 4, 5]"
              prepend-inner-icon="mdi-star"
              variant="outlined"
              hint="1 = Más alto, 5 = Más bajo"
              persistent-hint
              class="mb-4"
            ></v-select>

            <v-switch
              v-model="formData.is_active"
              label="Activo"
              color="success"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            color="grey"
            variant="text"
            @click="handleCancel"
          >
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="saving"
            @click="handleSave"
          >
            {{ editingItem ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { sellersService } from '@/services/sellersService'

const toast = useToast()

// Estado
const sellers = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showCreateDialog = ref(false)
const editingItem = ref(null)
const formRef = ref(null)

const formData = ref({
  name: '',
  whatsapp_number: '',
  email: '',
  phone: '',
  description: '',
  priority: 3,
  is_active: true
})

// Headers de la tabla
const headers = [
  { title: 'Vendedor', key: 'name', sortable: true },
  { title: 'WhatsApp', key: 'whatsapp_number', sortable: false },
  { title: 'Estado', key: 'is_active', sortable: true },
  { title: 'Prioridad', key: 'priority', sortable: true },
  { title: 'Recargas', key: 'recharges_count', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

// Validaciones
const rules = {
  required: v => !!v || 'Campo requerido',
  email: v => !v || /.+@.+\..+/.test(v) || 'Email inválido',
  phone: v => !v || /^\+\d{10,15}$/.test(v) || 'Formato: +591XXXXXXXXX'
}

// Computed
const filteredSellers = computed(() => {
  if (!search.value) return sellers.value

  const searchLower = search.value.toLowerCase()
  return sellers.value.filter(s =>
    s.name.toLowerCase().includes(searchLower) ||
    s.email?.toLowerCase().includes(searchLower) ||
    s.whatsapp_number.includes(searchLower)
  )
})

const activeSellers = computed(() =>
  sellers.value.filter(s => s.is_active).length
)

const inactiveSellers = computed(() =>
  sellers.value.filter(s => !s.is_active).length
)

const totalRecharges = computed(() =>
  sellers.value.reduce((sum, s) => sum + (s.recharges_count || 0), 0)
)

// Methods
const loadSellers = async () => {
  try {
    loading.value = true
    const response = await sellersService.adminGetSellers()
    if (response.success) {
      sellers.value = response.sellers || []
    }
  } catch (error) {
    console.error('Error loading sellers:', error)
    toast.error('Error al cargar vendedores')
  } finally {
    loading.value = false
  }
}

const handleEdit = (item) => {
  editingItem.value = item
  formData.value = {
    name: item.name,
    whatsapp_number: item.whatsapp_number,
    email: item.email || '',
    phone: item.phone || '',
    description: item.description || '',
    priority: item.priority,
    is_active: item.is_active
  }
  showCreateDialog.value = true
}

const handleDelete = async (item) => {
  if (!confirm(`¿Eliminar vendedor "${item.name}"?`)) return

  try {
    await sellersService.adminDeleteSeller(item.id)
    toast.success('Vendedor eliminado')
    loadSellers()
  } catch (error) {
    console.error('Error deleting seller:', error)
    toast.error('Error al eliminar vendedor')
  }
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    saving.value = true

    if (editingItem.value) {
      await sellersService.adminUpdateSeller(editingItem.value.id, formData.value)
      toast.success('Vendedor actualizado')
    } else {
      await sellersService.adminCreateSeller(formData.value)
      toast.success('Vendedor creado')
    }

    showCreateDialog.value = false
    loadSellers()
  } catch (error) {
    console.error('Error saving seller:', error)
    toast.error('Error al guardar vendedor')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  showCreateDialog.value = false
  editingItem.value = null
  formRef.value?.reset()
  formData.value = {
    name: '',
    whatsapp_number: '',
    email: '',
    phone: '',
    description: '',
    priority: 3,
    is_active: true
  }
}

// Lifecycle
onMounted(() => {
  loadSellers()
})
</script>

<style scoped>
.admin-sellers {
  padding: 24px;
}

.bg-gradient-admin {
  background: linear-gradient(135deg, #7c4dff 0%, #651fff 100%);
  color: white !important;
}

.bg-gradient-admin :deep(*) {
  color: white !important;
}

/* Mejoras en las tarjetas */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Mejoras en la tabla */
:deep(.v-table thead tr th) {
  background: #f8fafc !important;
  font-weight: 600;
  color: #374151 !important;
}

:deep(.v-table tbody tr:hover) {
  background: #f1f5f9 !important;
}
</style>
