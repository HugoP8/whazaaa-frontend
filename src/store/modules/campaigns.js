// src/store/modules/campaigns.js
import api, { campaignAPI } from '@/services/api'
import { useToast } from 'vue-toastification'
import { CAMPAIGN_STATUS } from '@/utils/constants'

const toast = useToast()

const state = {
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,
  successMessage: null,
  infoMessage: null,
  reuseData: null,
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

  UPDATE_CAMPAIGN_STATUS(state, { campaignId, status }) {
    console.log('[Campaigns Store] UPDATE_CAMPAIGN_STATUS:', campaignId, status)
    const campaign = state.campaigns.find(c => c.id === campaignId)
    if (campaign) {
      campaign.status = status
    }

    // Actualizar campaña actual si coincide
    if (state.currentCampaign?.id === campaignId) {
      state.currentCampaign.status = status
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
  },

  SET_SUCCESS_MESSAGE(state, message) {
    state.successMessage = message
  },

  SET_INFO_MESSAGE(state, message) {
    state.infoMessage = message
  },

  SET_REUSE_DATA(state, data) {
    console.log('[Campaigns Store] SET_REUSE_DATA:', data)
    state.reuseData = data
  },

  CLEAR_REUSE_DATA(state) {
    console.log('[Campaigns Store] CLEAR_REUSE_DATA')
    state.reuseData = null
  },

  CLEAR_MESSAGES(state) {
    state.successMessage = null
    state.infoMessage = null
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
  
  // Obtener estadísticas de campañas mejoradas
  async fetchCampaignStats({ commit }) {
    try {
      console.log('[Campaigns Store] Obteniendo estadísticas mejoradas de campañas')
      const response = await api.get('/campaigns/stats')

      const stats = response.data.data || response.data
      console.log('[Campaigns Store] Estadísticas obtenidas:', stats)

      // Las estadísticas ahora incluyen todas las métricas y chartData para gráficos
      return {
        totalCampaigns: stats.totalCampaigns || 0,
        completedCampaigns: stats.completedCampaigns || 0,
        activeCampaigns: stats.activeCampaigns || 0,
        pausedCampaigns: stats.pausedCampaigns || 0,
        failedCampaigns: stats.failedCampaigns || 0,
        messageStats: stats.messageStats || {
          totalSent: 0,
          successful: 0,
          failed: 0
        },
        avgMessagesPerCampaign: stats.avgMessagesPerCampaign || 0,
        totalContacts: stats.totalContacts || 0,
        totalGroups: stats.totalGroups || 0,
        lastCampaignDate: stats.lastCampaignDate || null,
        chartData: stats.chartData || null,
        ...stats
      }
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo estadísticas:', error)
      // Retornar estructura por defecto en caso de error
      return {
        totalCampaigns: 0,
        completedCampaigns: 0,
        activeCampaigns: 0,
        pausedCampaigns: 0,
        failedCampaigns: 0,
        messageStats: {
          totalSent: 0,
          successful: 0,
          failed: 0
        },
        avgMessagesPerCampaign: 0,
        totalContacts: 0,
        totalGroups: 0,
        lastCampaignDate: null,
        chartData: null
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

  // Limpiar mensajes
  clearMessages({ commit }) {
    commit('CLEAR_MESSAGES')
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
  async createCampaignFromReuse({ commit, dispatch }, { formData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      console.log('🔄 [CAMPAIGNS STORE] === ENVIANDO CAMPAÑA REUTILIZADA ===')

      // Log del FormData antes de enviar
      console.log('🔄 [CAMPAIGNS STORE] FormData type:', formData.constructor.name)
      console.log('🔄 [CAMPAIGNS STORE] FormData entries:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`🔄 [CAMPAIGNS STORE] ${key}: FILE - "${value.name}" (${value.size} bytes, type: ${value.type})`)
        } else {
          console.log(`🔄 [CAMPAIGNS STORE] ${key}: "${value}"`)
        }
      }

      const response = await api.post('/campaigns/reuse', formData, {
        timeout: 60000, // 60 segundos
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('[Campaigns Store] Respuesta recibida:', response.data)

      if (response.data.success) {
        const { campaignId, async, totalRecipients, type } = response.data.data

        // Si es asíncrona, mostrar mensaje y refrescar campañas
        if (async) {
          console.log(`[Campaigns Store] Campaña ${campaignId} iniciada en segundo plano`)

          // Refrescar lista de campañas para mostrar la nueva
          dispatch('fetchCampaigns', { page: 1, perPage: 20 })

          return {
            success: true,
            async: true,
            campaignId,
            message: `Campaña iniciada con ${totalRecipients} destinatarios. El progreso se mostrará en tiempo real.`
          }
        }

        return response.data
      }

    } catch (error) {
      console.error('[Campaigns Store] Error creando campaña reutilizada:', error)

      if (error.code === 'ECONNABORTED') {
        // Timeout - la campaña probablemente se inició
        console.log('[Campaigns Store] Timeout detectado - campaña puede estar ejecutándose')

        // Refrescar campañas para ver si se creó
        dispatch('fetchCampaigns', { page: 1, perPage: 20 })

        return {
          success: true,
          async: true,
          message: 'Campaña iniciada (timeout detectado). Revisa el progreso en la lista de campañas.'
        }
      }

      commit('SET_ERROR', error.message || 'Error creating campaign')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Cancelar campaña en progreso
  async cancelCampaign({ commit }, campaignId) {
    try {
      console.log('[Campaigns Store] Cancelando campaña:', campaignId)

      const response = await api.post(`/campaigns/${campaignId}/cancel`, {
        timeout: 30000
      })

      console.log('[Campaigns Store] Respuesta de cancelación:', response.data)

      if (response.data.success) {
        // Actualizar estado local inmediatamente
        commit('UPDATE_CAMPAIGN_STATUS', {
          campaignId,
          status: 'CANCELLED'
        })

        return { success: true, message: response.data.message }
      }

      return response.data
    } catch (error) {
      console.error('[Campaigns Store] Error cancelando campaña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al cancelar campaña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    }
  },

  // Reenviar campaña existente con timeout extendido
  async resendCampaign({ commit, dispatch }, campaignId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_MESSAGES')

      console.log('[Campaigns Store] Reenviando campaña:', campaignId)

      // Usar campaignAPI con timeout extendido para reenvíos
      const response = await campaignAPI.post(`/campaigns/${campaignId}/resend`)

      if (response.data.success) {
        // Mostrar mensaje de éxito inmediato
        commit('SET_SUCCESS_MESSAGE', response.data.message)
        toast.success(response.data.message)

        // Si es asíncrono, mostrar información adicional
        if (response.data.data?.async) {
          commit('SET_INFO_MESSAGE', response.data.data.note)
          toast.info('Recibirás notificaciones del progreso en tiempo real', {
            timeout: 8000
          })
        }

        // Agregar la nueva campaña si existe
        if (response.data.data?.campaign) {
          commit('ADD_CAMPAIGN', response.data.data.campaign)
        }

        // Refrescar lista de campañas
        await dispatch('fetchCampaigns')

        return response.data
      } else {
        throw new Error(response.data.error || 'Error desconocido')
      }

    } catch (error) {
      console.error('[Campaigns Store] Error reenviando campaña:', error)

      // Manejar diferentes tipos de error
      if (error.code === 'ECONNABORTED') {
        const timeoutMessage = 'La operación está tomando más tiempo del esperado, pero puede estar procesándose en segundo plano'
        commit('SET_INFO_MESSAGE', timeoutMessage)
        toast.warning(timeoutMessage, { timeout: 10000 })
      } else if (error.response?.status === 400 && error.response.data?.requiresConnection) {
        commit('SET_ERROR', 'Necesitas conectar WhatsApp primero')
        toast.error('Necesitas conectar WhatsApp antes de reenviar la campaña')
      } else {
        const errorMessage = error.response?.data?.error ||
                            error.response?.data?.message ||
                            error.message ||
                            'Error al reenviar campaña'
        commit('SET_ERROR', errorMessage)
        toast.error(errorMessage)
      }

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

  // Datos de reutilización
  reuseData: state => {
    console.log('[Campaigns Store] getter reuseData:', state.reuseData)
    return state.reuseData
  },
  
  // Verificar si hay filtros activos
  hasActiveFilters: state => {
    const hasFilters = !!(state.filters.status || state.filters.search || state.filters.dateRange)
    console.log('[Campaigns Store] getter hasActiveFilters:', hasFilters)
    return hasFilters
  },

  // Mensajes del estado
  successMessage: state => state.successMessage,
  infoMessage: state => state.infoMessage,

  // Campañas con estado extendido
  campaignsWithStatus: state => {
    return state.campaigns.map(campaign => ({
      ...campaign,
      isProcessing: campaign.status === 'IN_PROGRESS' || campaign.status === 'RUNNING',
      isAsync: (campaign.status === 'IN_PROGRESS' || campaign.status === 'RUNNING') &&
               (campaign.name.includes('(Reenviada)') ||
                campaign.name.includes('(Copia)') ||
                campaign.name.includes('(Reutilizada)'))
    }))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}