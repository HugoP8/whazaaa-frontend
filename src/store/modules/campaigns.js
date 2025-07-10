import { campaignService } from '@/services/campaignService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  campaigns: [],
  currentCampaign: null,
  stats: {
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0
  },
  loading: false
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
    const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id)
    if (index !== -1) {
      state.campaigns.splice(index, 1, updatedCampaign)
    }
  },
  
  DELETE_CAMPAIGN(state, campaignId) {
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
  },
  
  SET_STATS(state, stats) {
    state.stats = stats
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  async fetchCampaigns({ commit }) {
    commit('SET_LOADING', true)
    try {
      const campaigns = await campaignService.getCampaigns()
      commit('SET_CAMPAIGNS', campaigns)
      
      // Calcular estadísticas
      const stats = {
        total: campaigns.length,
        completed: campaigns.filter(c => c.status === 'COMPLETED').length,
        inProgress: campaigns.filter(c => c.status === 'IN_PROGRESS').length,
        failed: campaigns.filter(c => c.status === 'FAILED').length
      }
      commit('SET_STATS', stats)
      
      return campaigns
    } catch (error) {
      toast.error('Error al cargar campañas')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async fetchCampaignById({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const campaign = await campaignService.getCampaignById(id)
      commit('SET_CURRENT_CAMPAIGN', campaign)
      return campaign
    } catch (error) {
      toast.error('Error al cargar detalles de la campaña')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createCampaign({ commit }, campaignData) {
    commit('SET_LOADING', true)
    try {
      const campaign = await campaignService.createCampaign(campaignData)
      commit('ADD_CAMPAIGN', campaign)
      toast.success('Campaña creada exitosamente')
      return campaign
    } catch (error) {
      toast.error('Error al crear campaña')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async updateCampaign({ commit }, { id, data }) {
    try {
      const campaign = await campaignService.updateCampaign(id, data)
      commit('UPDATE_CAMPAIGN', campaign)
      toast.success('Campaña actualizada')
      return campaign
    } catch (error) {
      toast.error('Error al actualizar campaña')
      throw error
    }
  },
  
  async deleteCampaign({ commit }, id) {
    try {
      await campaignService.deleteCampaign(id)
      commit('DELETE_CAMPAIGN', id)
      toast.success('Campaña eliminada')
    } catch (error) {
      toast.error('Error al eliminar campaña')
      throw error
    }
  },
  
  async exportResults({ commit }, campaignId) {
    try {
      const blob = await campaignService.exportCampaignResults(campaignId)
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `campaign-${campaignId}-results.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Resultados exportados')
    } catch (error) {
      toast.error('Error al exportar resultados')
      throw error
    }
  }
}

const getters = {
  allCampaigns: state => state.campaigns,
  currentCampaign: state => state.currentCampaign,
  campaignStats: state => state.stats,
  campaignsLoading: state => state.loading,
  
  recentCampaigns: state => {
    return state.campaigns.slice(0, 5)
  },
  
  campaignsByStatus: state => status => {
    return state.campaigns.filter(c => c.status === status)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}