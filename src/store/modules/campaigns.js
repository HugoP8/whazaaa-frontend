// src/store/modules/campaigns.js
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { CAMPAIGN_STATUS } from '@/utils/constants'

const toast = useToast()

const state = {
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0
  },
  filters: {
    status: null,
    search: null,
    dateRange: null
  }
}

const mutations = {
  SET_CAMPAIGNS(state, campaigns) {
    console.log('[Campaigns Store] SET_CAMPAIGNS:', campaigns.length, 'campañas')
    state.campaigns = campaigns
  },
  
  SET_CURRENT_CAMPAIGN(state, campaign) {
    console.log('[Campaigns Store] SET_CURRENT_CAMPAIGN:', campaign?.id || 'null')
    state.currentCampaign = campaign
  },
  
  ADD_CAMPAIGN(state, campaign) {
    console.log('[Campaigns Store] ADD_CAMPAIGN:', campaign.id)
    state.campaigns.unshift(campaign)
  },
  
  UPDATE_CAMPAIGN(state, updatedCampaign) {
    console.log('[Campaigns Store] UPDATE_CAMPAIGN:', updatedCampaign.id)
    const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id)
    if (index !== -1) {
      state.campaigns.splice(index, 1, updatedCampaign)
    }
    
    // Actualizar campaña actual si es la misma
    if (state.currentCampaign?.id === updatedCampaign.id) {
      state.currentCampaign = updatedCampaign
    }
  },
  
  DELETE_CAMPAIGN(state, campaignId) {
    console.log('[Campaigns Store] DELETE_CAMPAIGN:', campaignId)
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
    
    // Limpiar campaña actual si es la que se eliminó
    if (state.currentCampaign?.id === campaignId) {
      state.currentCampaign = null
    }
  },
  
  SET_LOADING(state, loading) {
    console.log('[Campaigns Store] SET_LOADING:', loading)
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    console.log('[Campaigns Store] SET_ERROR:', error)
    state.error = error
  },
  
  SET_PAGINATION(state, pagination) {
    console.log('[Campaigns Store] SET_PAGINATION:', pagination)
    state.pagination = { ...state.pagination, ...pagination }
  },
  
  SET_FILTERS(state, filters) {
    console.log('[Campaigns Store] SET_FILTERS:', filters)
    state.filters = { ...state.filters, ...filters }
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // Obtener todas las campañas
  async fetchCampaigns({ commit, state }, params = {}) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Obteniendo campañas con parámetros:', params)
      
      const queryParams = {
        page: params.page || state.pagination.page,
        perPage: params.perPage || state.pagination.perPage,
        ...state.filters,
        ...params
      }
      
      const response = await api.get('/campaigns', { params: queryParams })
      
      const { data, pagination } = response.data
      
      commit('SET_CAMPAIGNS', data || [])
      commit('SET_PAGINATION', pagination)
      
      console.log('[Campaigns Store] Campañas obtenidas exitosamente:', data?.length || 0)
      return data
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo campañas:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar campañas'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Obtener una campaña específica
  async fetchCampaign({ commit }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Obteniendo campaña:', campaignId)
      const response = await api.get(`/campaigns/${campaignId}`)
      
      console.log('[Campaigns Store] Respuesta completa para campaña:', response.data)
      
      // Intentar diferentes estructuras de respuesta
      const campaign = response.data.data || response.data || response
      
      if (!campaign) {
        throw new Error('Campaña no encontrada en la respuesta')
      }
      
      commit('SET_CURRENT_CAMPAIGN', campaign)
      
      console.log('[Campaigns Store] Campaña obtenida:', campaign.name || campaign.id || 'Sin nombre')
      return campaign
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Crear nueva campaña
  async createCampaign({ commit }, campaignData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Creando nueva campaña:', campaignData.name)
      const response = await api.post('/campaigns', campaignData)
      
      const newCampaign = response.data.data
      commit('ADD_CAMPAIGN', newCampaign)
      
      toast.success(`Campaña "${newCampaign.name}" creada exitosamente`)
      console.log('[Campaigns Store] Campaña creada:', newCampaign.id)
      
      return newCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error creando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Actualizar campaña
  async updateCampaign({ commit }, { campaignId, campaignData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Actualizando campaña:', campaignId)
      const response = await api.put(`/campaigns/${campaignId}`, campaignData)
      
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      
      toast.success(`Campaña "${updatedCampaign.name}" actualizada exitosamente`)
      console.log('[Campaigns Store] Campaña actualizada:', updatedCampaign.id)
      
      return updatedCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error actualizando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Eliminar campaña
  async deleteCampaign({ commit }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Eliminando campaña:', campaignId)
      await api.delete(`/campaigns/${campaignId}`)
      
      commit('DELETE_CAMPAIGN', campaignId)
      
      toast.success('Campaña eliminada exitosamente')
      console.log('[Campaigns Store] Campaña eliminada:', campaignId)
    } catch (error) {
      console.error('[Campaigns Store] Error eliminando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Ejecutar campaña
  async runCampaign({ commit, dispatch }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Ejecutando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/run`)
      
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      
      toast.success('Campaña iniciada exitosamente')
      console.log('[Campaigns Store] Campaña ejecutada:', campaignId)
      
      return updatedCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error ejecutando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al ejecutar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Pausar campaña
  async pauseCampaign({ commit }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Pausando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/pause`)
      
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      
      toast.success('Campaña pausada exitosamente')
      console.log('[Campaigns Store] Campaña pausada:', campaignId)
      
      return updatedCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error pausando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al pausar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Reanudar campaña
  async resumeCampaign({ commit }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Reanudando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/resume`)
      
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      
      toast.success('Campaña reanudada exitosamente')
      console.log('[Campaigns Store] Campaña reanudada:', campaignId)
      
      return updatedCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error reanudando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al reanudar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Obtener estadísticas de campañas
  async fetchCampaignStats({ commit }) {
    try {
      console.log('[Campaigns Store] Obteniendo estadísticas de campañas')
      const response = await api.get('/campaigns/stats')
      
      const stats = response.data.data
      console.log('[Campaigns Store] Estadísticas obtenidas:', stats)
      
      return stats
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo estadísticas:', error)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        failed: 0
      }
    }
  },
  
  // Aplicar filtros
  async applyFilters({ commit, dispatch }, filters) {
    commit('SET_FILTERS', filters)
    commit('SET_PAGINATION', { page: 1 }) // Reset a primera página
    await dispatch('fetchCampaigns')
  },
  
  // Limpiar filtros
  async clearFilters({ commit, dispatch }) {
    commit('SET_FILTERS', {
      status: null,
      search: null,
      dateRange: null
    })
    commit('SET_PAGINATION', { page: 1 })
    await dispatch('fetchCampaigns')
  },
  
  // Limpiar errores
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  },
  
  // Limpiar campaña actual
  clearCurrentCampaign({ commit }) {
    commit('SET_CURRENT_CAMPAIGN', null)
  },

  // Obtener campaña por ID (alias para fetchCampaign)
  async fetchCampaignById({ dispatch }, campaignId) {
    return await dispatch('fetchCampaign', campaignId)
  },

  // Obtener datos para reutilizar campaña
  async getCampaignReuseData({ commit }, campaignId) {
    try {
      console.log('[Campaigns Store] Obteniendo datos de reutilización para campaña:', campaignId)
      const response = await api.get(`/campaigns/${campaignId}/reuse-data`)
      
      console.log('[Campaigns Store] Datos de reutilización obtenidos:', response.data)
      return response.data.data || response.data
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo datos de reutilización:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener datos de reutilización'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    }
  },

  // Crear campaña desde datos reutilizados
  async createCampaignFromReuse({ commit, dispatch }, reuseData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Creando campaña reutilizada:', reuseData)
      
      const formData = new FormData()

      // Datos básicos
      formData.append('name', reuseData.name)
      formData.append('message', reuseData.message)
      formData.append('recipients', JSON.stringify(reuseData.recipients))
      formData.append('type', reuseData.type)

      // Media existente
      if (reuseData.mediaPath) {
        formData.append('mediaPath', reuseData.mediaPath)
      }

      // Nuevo archivo
      if (reuseData.newFile) {
        formData.append('media', reuseData.newFile)
      }

      const response = await api.post('/campaigns/reuse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const newCampaign = response.data.data || response.data
      commit('ADD_CAMPAIGN', newCampaign)
      
      console.log('[Campaigns Store] Campaña reutilizada creada:', newCampaign.id)
      
      // Refrescar la lista de campañas
      await dispatch('fetchCampaigns')

      return newCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error creando campaña reutilizada:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear campaña reutilizada'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Reenviar campaña existente
  async resendCampaign({ commit, dispatch }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Reenviando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/resend`)
      
      const resentCampaign = response.data.data || response.data
      commit('ADD_CAMPAIGN', resentCampaign)
      
      toast.success(`Campaña reenviada: ${resentCampaign.name}`)
      console.log('[Campaigns Store] Campaña reenviada:', resentCampaign.id)
      
      // Refrescar la lista de campañas
      await dispatch('fetchCampaigns')
      
      return response.data
    } catch (error) {
      console.error('[Campaigns Store] Error reenviando campaña:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al reenviar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Duplicar campaña
  async duplicateCampaign({ commit, dispatch }, { campaignId, newName = null }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Campaigns Store] Duplicando campaña:', campaignId, 'con nombre:', newName)
      const response = await api.post(`/campaigns/${campaignId}/duplicate`, {
        newName
      })
      
      const duplicatedCampaign = response.data.data || response.data
      commit('ADD_CAMPAIGN', duplicatedCampaign)
      
      toast.success(`Campaña duplicada: ${duplicatedCampaign.name}`)
      console.log('[Campaigns Store] Campaña duplicada:', duplicatedCampaign.id)
      
      // Refrescar la lista de campañas
      await dispatch('fetchCampaigns')
      
      return duplicatedCampaign
    } catch (error) {
      console.error('[Campaigns Store] Error duplicando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al duplicar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  // Todas las campañas
  campaigns: state => {
    console.log('[Campaigns Store] getter campaigns:', state.campaigns.length)
    return state.campaigns
  },
  
  // Campaña actual
  currentCampaign: state => {
    console.log('[Campaigns Store] getter currentCampaign:', state.currentCampaign?.id || 'null')
    return state.currentCampaign
  },
  
  // Campañas por estado
  campaignsByStatus: (state) => (status) => {
    const filtered = state.campaigns.filter(campaign => campaign.status === status)
    console.log(`[Campaigns Store] getter campaignsByStatus(${status}):`, filtered.length)
    return filtered
  },
  
  // Campañas recientes (últimas 5)
  recentCampaigns: state => {
    const recent = state.campaigns
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
    console.log('[Campaigns Store] getter recentCampaigns:', recent.length)
    return recent
  },
  
  // Estadísticas rápidas
  campaignStats: state => {
    const stats = state.campaigns.reduce((acc, campaign) => {
      acc.total++
      if (campaign.status === CAMPAIGN_STATUS.COMPLETED) {
        acc.completed++
      } else if (campaign.status === CAMPAIGN_STATUS.RUNNING) {
        acc.inProgress++
      } else if (campaign.status === CAMPAIGN_STATUS.FAILED) {
        acc.failed++
      }
      return acc
    }, { total: 0, completed: 0, inProgress: 0, failed: 0 })
    
    console.log('[Campaigns Store] getter campaignStats:', stats)
    return stats
  },
  
  // Estado de carga
  loading: state => {
    console.log('[Campaigns Store] getter loading:', state.loading)
    return state.loading
  },
  
  // Error actual
  error: state => {
    console.log('[Campaigns Store] getter error:', state.error)
    return state.error
  },
  
  // Información de paginación
  pagination: state => {
    console.log('[Campaigns Store] getter pagination:', state.pagination)
    return state.pagination
  },
  
  // Filtros activos
  filters: state => {
    console.log('[Campaigns Store] getter filters:', state.filters)
    return state.filters
  },
  
  // Verificar si hay filtros activos
  hasActiveFilters: state => {
    const hasFilters = !!(state.filters.status || state.filters.search || state.filters.dateRange)
    console.log('[Campaigns Store] getter hasActiveFilters:', hasFilters)
    return hasFilters
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}