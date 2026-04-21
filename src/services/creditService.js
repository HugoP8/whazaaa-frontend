// src/services/creditService.js
import api from './api'

export const creditService = {
  // ========== USUARIO - CONSULTAS ==========

  /**
   * Obtener balance de créditos del usuario actual
   */
  async getMyBalance() {
    const response = await api.get('/credits/my-balance')
    return response.data
  },

  /**
   * Obtener historial de uso de créditos
   */
  async getMyHistory(params = {}) {
    const response = await api.get('/credits/my-history', { params })
    return response.data
  },

  /**
   * Obtener información de recargas disponibles
   */
  async getRechargeOptions() {
    const response = await api.get('/credits/recharge-options')
    return response.data
  },

  /**
   * Solicitar recarga (registro de intención, no pago)
   */
  async requestRecharge(data) {
    const response = await api.post('/credits/request-recharge', data)
    return response.data
  },

  // ========== ADMIN - GESTIÓN DE CRÉDITOS ==========
  // NOTA: Las rutas admin de créditos están bajo /credits/admin/... en el backend

  /**
   * Recargar créditos manualmente a un usuario (ADMIN)
   */
  async adminRechargeCredits(userId, data) {
    const response = await api.post(`/credits/admin/recharge/${userId}`, data)
    return response.data
  },

  /**
   * Obtener balance de créditos de cualquier usuario (ADMIN)
   */
  async adminGetUserBalance(userId) {
    const response = await api.get(`/credits/admin/balance/${userId}`)
    return response.data
  },

  /**
   * Obtener historial de créditos de un usuario (ADMIN)
   */
  async adminGetUserHistory(userId, params = {}) {
    const response = await api.get(`/credits/admin/history/${userId}`, { params })
    return response.data
  },

  /**
   * Cambiar plan con créditos incluidos (ADMIN)
   */
  async adminChangePlanWithCredits(userId, data) {
    const response = await api.post(`/credits/admin/change-plan/${userId}`, data)
    return response.data
  },

  /**
   * Obtener estadísticas de uso de créditos (ADMIN)
   */
  async adminGetCreditStats() {
    const response = await api.get('/credits/admin/stats')
    return response.data
  },

  /**
   * Obtener lista de solicitudes de recarga pendientes (ADMIN)
   */
  async adminGetPendingRecharges(params = {}) {
    const response = await api.get('/credits/admin/pending-recharges', { params })
    return response.data
  },

  /**
   * Marcar solicitud de recarga como procesada (ADMIN)
   */
  async adminProcessRecharge(requestId, data) {
    const response = await api.post(`/credits/admin/process-recharge/${requestId}`, data)
    return response.data
  }
}
