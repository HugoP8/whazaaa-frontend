import api from './api'

export const subscriptionService = {
  // Obtener todos los planes públicos
  async getPublicPlans() {
    const response = await api.get('/plans/public')
    return response.data
  },

  // Obtener un plan específico
  async getPlanById(id) {
    const response = await api.get(`/plans/public/${id}`)
    return response.data
  },

  // Obtener mi suscripción actual
  async getMySubscription() {
    const response = await api.get('/subscriptions/my-subscription')
    return response.data
  },

  // Historial de suscripciones
  async getMyHistory() {
    const response = await api.get('/subscriptions/history')
    return response.data
  },

  // Renovar membresía (manual)
  async renewSubscription(days) {
    const response = await api.post('/subscriptions/renew', { days })
    return response.data
  },

  // Crear sesión de checkout (Stripe)
  async createCheckoutSession(planId, billingPeriod = 'monthly') {
    const response = await api.post('/payments/create-checkout', {
      plan_id: planId,
      billing_period: billingPeriod
    })
    return response.data
  },

  // Cancelar suscripción
  async cancelSubscription() {
    const response = await api.post('/payments/cancel-subscription')
    return response.data
  },

  // Historial de pagos
  async getPaymentHistory() {
    const response = await api.get('/payments/history')
    return response.data
  },

  // Portal del cliente (Stripe)
  async getCustomerPortal() {
    const response = await api.get('/payments/customer-portal')
    return response.data
  },

  // ===== ENDPOINTS DE ADMINISTRADOR =====

  // Obtener todas las suscripciones (admin)
  async getAdminSubscriptions(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const response = await api.get(`/admin/subscriptions?${queryString}`)
    return response.data
  },

  // Obtener suscripciones por vencer (admin)
  async getExpiringSubscriptions(days = 7) {
    const response = await api.get(`/admin/subscriptions/expiring-soon?days=${days}`)
    return response.data
  },

  // Extender membresía de un usuario (admin)
  async extendUserSubscription(userId, days) {
    const response = await api.post(`/admin/users/${userId}/extend-subscription`, { days })
    return response.data
  },

  // Cambiar plan de un usuario (admin) - Sin pago, manual
  async changeUserPlan(userId, planName, durationMonths = 1) {
    const response = await api.post(`/admin/users/${userId}/change-plan`, {
      plan_name: planName,
      duration_months: durationMonths
    })
    return response.data
  },

  // Cambiar estado de una suscripción (admin)
  async updateSubscriptionStatus(subscriptionId, status) {
    const response = await api.put(`/admin/subscriptions/${subscriptionId}/status`, { status })
    return response.data
  },

  // Obtener estadísticas de suscripciones (admin)
  async getSubscriptionStats() {
    const response = await api.get('/admin/subscriptions/stats')
    return response.data
  }
}
