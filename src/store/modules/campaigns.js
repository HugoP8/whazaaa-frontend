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
    state.campaigns = campaigns
  },

  SET_CURRENT_CAMPAIGN(state, campaign) {
    state.currentCampaign = campaign
  },

  ADD_CAMPAIGN(state, campaign) {
    state.campaigns.unshift(campaign)
  },

  UPDATE_CAMPAIGN(state, updatedCampaign) {
    const index = state.campaigns.findIndex(c => String(c.id) === String(updatedCampaign.id))
    if (index !== -1) {
      state.campaigns.splice(index, 1, { ...state.campaigns[index], ...updatedCampaign })
    }
    if (state.currentCampaign?.id == updatedCampaign.id) {
      state.currentCampaign = { ...state.currentCampaign, ...updatedCampaign }
    }
  },

  UPDATE_CAMPAIGN_STATUS(state, { campaignId, status }) {
    const index = state.campaigns.findIndex(c => String(c.id) === String(campaignId))
    if (index !== -1) {
      state.campaigns.splice(index, 1, { ...state.campaigns[index], status })
    }
    if (state.currentCampaign?.id == campaignId) {
      state.currentCampaign = { ...state.currentCampaign, status }
    }
  },

  UPDATE_CAMPAIGN_PROGRESS(state, { campaignId, sentCount, totalCount }) {
    const index = state.campaigns.findIndex(c => String(c.id) === String(campaignId))
    if (index === -1) return
    state.campaigns.splice(index, 1, {
      ...state.campaigns[index],
      sent_count: sentCount,
      total_recipients: totalCount || state.campaigns[index].total_recipients,
      status: 'IN_PROGRESS'
    })
  },

  UPDATE_CAMPAIGN_COMPLETED(state, { campaignId, status, successCount }) {
    const index = state.campaigns.findIndex(c => String(c.id) === String(campaignId))
    if (index === -1) return
    state.campaigns.splice(index, 1, {
      ...state.campaigns[index],
      status: status || 'COMPLETED',
      sent_count: successCount,
      completed_at: new Date().toISOString()
    })
  },

  DELETE_CAMPAIGN(state, campaignId) {
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
    if (state.currentCampaign?.id === campaignId) {
      state.currentCampaign = null
    }
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination }
  },

  SET_FILTERS(state, filters) {
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
    state.reuseData = data
  },

  CLEAR_REUSE_DATA(state) {
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
      const response = await api.get(`/campaigns/${campaignId}`)
      const campaign = response.data.data || response.data || response

      if (!campaign) throw new Error('Campaña no encontrada en la respuesta')

      commit('SET_CURRENT_CAMPAIGN', campaign)
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
      const response = await api.post('/campaigns', campaignData)
      const newCampaign = response.data.data
      commit('ADD_CAMPAIGN', newCampaign)
      toast.success(`Campaña "${newCampaign.name}" creada exitosamente`)
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
      const response = await api.put(`/campaigns/${campaignId}`, campaignData)
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      toast.success(`Campaña "${updatedCampaign.name}" actualizada exitosamente`)
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
      await api.delete(`/campaigns/${campaignId}`)
      commit('DELETE_CAMPAIGN', campaignId)
      toast.success('Campaña eliminada exitosamente')
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
  async runCampaign({ commit }, campaignId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post(`/campaigns/${campaignId}/run`)
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      toast.success('Campaña iniciada exitosamente')
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
      const response = await api.post(`/campaigns/${campaignId}/pause`)
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      toast.success('Campaña pausada exitosamente')
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
      const response = await api.post(`/campaigns/${campaignId}/resume`)
      const updatedCampaign = response.data.data
      commit('UPDATE_CAMPAIGN', updatedCampaign)
      toast.success('Campaña reanudada exitosamente')
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
  
  // Obtener estadísticas de campañas mejoradas (ACTUALIZADO SEGÚN BACKEND)
  async fetchCampaignStats({ commit }) {
    try {
      const response = await api.get('/campaigns/stats')
      const stats = response.data.data || response.data

      // ✅ ACTUALIZADO: Usar nombres de campos del backend
      return {
        totalCampaigns: stats.totalCampaigns || 0,        // ✅ Correcto
        completedCampaigns: stats.completedCampaigns || 0,  // ✅ Correcto
        activeCampaigns: stats.activeCampaigns || 0,      // ✅ Correcto (era inProgress)
        pausedCampaigns: stats.pausedCampaigns || 0,      // ✅ Correcto
        failedCampaigns: stats.failedCampaigns || 0,      // ✅ Correcto
        messageStats: stats.messageStats || {             // ✅ NUEVO campo
          totalSent: 0,
          successful: 0,
          failed: 0
        },
        avgMessagesPerCampaign: stats.avgMessagesPerCampaign || 0,
        totalContacts: stats.totalContacts || 0,
        totalGroups: stats.totalGroups || 0,
        lastCampaignDate: stats.lastCampaignDate || null,
        chartData: stats.chartData || null,               // ✅ Formato Chart.js compatible
        ...stats
      }
    } catch (error) {
      console.error('[Campaigns Store] Error obteniendo estadísticas:', error)
      toast.error('Error al cargar estadísticas de campañas')

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
      const response = await api.get(`/campaigns/${campaignId}/reuse-data`)
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
      const response = await api.post('/campaigns/reuse', formData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        const { campaignId, async, totalRecipients } = response.data.data

        if (async) {
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
      const response = await api.post(`/campaigns/${campaignId}/cancel`, { timeout: 30000 })

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

      // Usar campaignAPI con timeout extendido para reenvíos
      const response = await campaignAPI.post(`/campaigns/${campaignId}/resend`)

      if (response.data.success) {
        commit('SET_SUCCESS_MESSAGE', response.data.message)
        toast.success(response.data.message)

        if (response.data.data?.async) {
          commit('SET_INFO_MESSAGE', response.data.data.note)
          toast.info('Recibirás notificaciones del progreso en tiempo real', { timeout: 8000 })
        }

        if (response.data.data?.campaign) {
          commit('ADD_CAMPAIGN', response.data.data.campaign)
        }

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

  // Actualizar progreso en tiempo real (llamado desde whatsapp store via cross-module dispatch)
  onCampaignProgress({ commit }, data) {
    commit('UPDATE_CAMPAIGN_PROGRESS', {
      campaignId: data.campaignId,
      sentCount: data.sent || data.sentCount || 0,
      totalCount: data.total || data.totalCount
    })
  },

  // Marcar campaña como completada en tiempo real
  async onCampaignCompleted({ commit, dispatch }, data) {
    commit('UPDATE_CAMPAIGN_COMPLETED', {
      campaignId: data.campaignId,
      status: data.status || 'COMPLETED',
      successCount: data.successCount
    })
    // Refrescar desde BD después de unos segundos para tener datos definitivos
    setTimeout(() => dispatch('fetchCampaigns'), 2000)
  },

  // Duplicar campaña
  async duplicateCampaign({ commit, dispatch }, { campaignId, newName = null }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post(`/campaigns/${campaignId}/duplicate`, { newName })
      const duplicatedCampaign = response.data.data || response.data
      commit('ADD_CAMPAIGN', duplicatedCampaign)
      toast.success(`Campaña duplicada: ${duplicatedCampaign.name}`)
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
  campaigns: state => state.campaigns,
  currentCampaign: state => state.currentCampaign,
  campaignsByStatus: state => status => state.campaigns.filter(c => c.status === status),
  recentCampaigns: state => state.campaigns.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
  campaignStats: state => state.campaigns.reduce((acc, c) => {
    acc.total++
    if (c.status === CAMPAIGN_STATUS.COMPLETED) acc.completed++
    else if (c.status === CAMPAIGN_STATUS.RUNNING) acc.inProgress++
    else if (c.status === CAMPAIGN_STATUS.FAILED) acc.failed++
    return acc
  }, { total: 0, completed: 0, inProgress: 0, failed: 0 }),
  loading: state => state.loading,
  error: state => state.error,
  pagination: state => state.pagination,
  filters: state => state.filters,
  reuseData: state => state.reuseData,
  hasActiveFilters: state => !!(state.filters.status || state.filters.search || state.filters.dateRange),
  successMessage: state => state.successMessage,
  infoMessage: state => state.infoMessage,
  campaignsWithStatus: state => state.campaigns.map(campaign => ({
    ...campaign,
    isProcessing: campaign.status === 'IN_PROGRESS' || campaign.status === 'RUNNING',
    isAsync: (campaign.status === 'IN_PROGRESS' || campaign.status === 'RUNNING') &&
             (campaign.name.includes('(Reenviada)') ||
              campaign.name.includes('(Copia)') ||
              campaign.name.includes('(Reutilizada)'))
  }))
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}