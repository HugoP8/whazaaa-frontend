// src/services/videoRewardsService.js
import api from './api'

export const videoRewardsService = {
  /**
   * Verificar si el usuario puede ver un video
   */
  async canWatch() {
    const response = await api.get('/video-rewards/can-watch')
    return response.data
  },

  /**
   * Completar video y recibir recompensa
   */
  async completeVideo(videoId, watchDuration) {
    const response = await api.post('/video-rewards/complete', {
      video_id: videoId,
      watch_duration: watchDuration
    })
    return response.data
  },

  /**
   * Obtener estadísticas personales
   */
  async getStats() {
    const response = await api.get('/video-rewards/stats')
    return response.data
  },

  // ============================================
  // ADMIN
  // ============================================

  /**
   * Obtener configuración de recompensas
   */
  async adminGetConfig() {
    const response = await api.get('/video-rewards/admin/config')
    return response.data
  },

  /**
   * Actualizar configuración de recompensas
   */
  async adminUpdateConfig(configs) {
    const response = await api.put('/video-rewards/admin/config', { configs })
    return response.data
  },

  /**
   * Obtener estadísticas globales
   */
  async adminGetStats(days = 30) {
    const response = await api.get('/video-rewards/admin/stats', { params: { days } })
    return response.data
  }
}

export default videoRewardsService
