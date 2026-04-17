<template>
  <div class="admin-reports">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Reportes</h1>
        <p class="text-body-1 text-grey">Análisis financiero, uso y publicidad</p>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6">
            <v-icon class="mr-2">mdi-file-chart</v-icon>
            Seleccionar Reporte
          </v-card-title>

          <v-card-text class="pa-6">
            <v-btn-toggle v-model="selectedReport" mandatory color="primary" class="mb-6">
              <v-btn value="financial">Financiero</v-btn>
              <v-btn value="usage">Uso</v-btn>
              <v-btn value="ads">Publicidad</v-btn>
            </v-btn-toggle>

            <!-- Financial Report -->
            <div v-if="selectedReport === 'financial'">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="financialFilters.startDate"
                    type="date"
                    label="Fecha Inicio"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="financialFilters.endDate"
                    type="date"
                    label="Fecha Fin"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                prepend-icon="mdi-magnify"
                @click="loadFinancialReport"
                :loading="loading"
              >
                Generar Reporte
              </v-btn>
            </div>

            <!-- Usage Report -->
            <div v-else-if="selectedReport === 'usage'">
              <v-btn
                color="primary"
                prepend-icon="mdi-magnify"
                @click="loadUsageReport"
                :loading="loading"
              >
                Generar Reporte
              </v-btn>
            </div>

            <!-- Ads Report -->
            <div v-else-if="selectedReport === 'ads'">
              <v-btn
                color="primary"
                prepend-icon="mdi-magnify"
                @click="loadAdsReport"
                :loading="loading"
              >
                Generar Reporte
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Results -->
    <v-row v-if="reportData" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="xl">
          <v-card-title class="pa-6 bg-info">
            Resultados del Reporte
          </v-card-title>

          <v-card-text class="pa-6">
            <pre>{{ JSON.stringify(reportData, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const selectedReport = ref('financial')
const reportData = ref(null)

const financialFilters = reactive({
  startDate: '',
  endDate: ''
})

const loading = computed(() => store.getters['admin/loading'])

const loadFinancialReport = async () => {
  const data = await store.dispatch('admin/fetchFinancialReport', financialFilters)
  reportData.value = data.data
}

const loadUsageReport = async () => {
  const data = await store.dispatch('admin/fetchUsageReport')
  reportData.value = data.data
}

const loadAdsReport = async () => {
  const data = await store.dispatch('admin/fetchAdsReport')
  reportData.value = data.data
}
</script>

<style scoped>
.admin-reports {
  max-width: 1600px;
}

.bg-info {
  background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
  color: white !important;
}

.bg-info :deep(.v-icon),
.bg-info :deep(.v-card-title) {
  color: white !important;
}

/* Card hover effects */
:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Report results */
pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
