import api from './api'

export const campaignService = {
  async createCampaign(campaignData) {
    const formData = new FormData()
    
    // Agregar campos del formulario
    formData.append('name', campaignData.name)
    formData.append('message', campaignData.message)
    formData.append('recipients', JSON.stringify(campaignData.recipients))
    formData.append('delay', campaignData.delay)
    
    // Agregar archivo si existe
    if (campaignData.media) {
      formData.append('media', campaignData.media)
    }
    
    const response = await api.post('/campaigns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data
  },

  async getCampaigns() {
    const response = await api.get('/campaigns')
    return response.data
  },

  async getCampaignById(id) {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  async updateCampaign(id, data) {
    const response = await api.put(`/campaigns/${id}`, data)
    return response.data
  },

  async deleteCampaign(id) {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },

  async getCampaignStats() {
    const response = await api.get('/campaigns/stats')
    return response.data
  },

  async exportCampaignResults(id) {
    const response = await api.get(`/campaigns/${id}/export`, {
      responseType: 'blob'
    })
    return response.data
  }
}