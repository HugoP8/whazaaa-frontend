import api from '@/services/api'

const state = {
  dashboard: null,
  users: [],
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  },
  selectedUser: null,
  financialReport: null,
  usageReport: null,
  adsReport: null,
  plans: [],
  loading: false,
  error: null
}

const getters = {
  dashboard: (state) => state.dashboard,
  users: (state) => state.users,
  usersPagination: (state) => state.usersPagination,
  selectedUser: (state) => state.selectedUser,
  financialReport: (state) => state.financialReport,
  usageReport: (state) => state.usageReport,
  adsReport: (state) => state.adsReport,
  plans: (state) => state.plans,
  loading: (state) => state.loading,
  error: (state) => state.error
}

const mutations = {
  SET_DASHBOARD(state, dashboard) {
    state.dashboard = dashboard
  },
  SET_USERS(state, users) {
    state.users = users
  },
  SET_USERS_PAGINATION(state, pagination) {
    state.usersPagination = pagination
  },
  SET_SELECTED_USER(state, user) {
    state.selectedUser = user
  },
  SET_FINANCIAL_REPORT(state, report) {
    state.financialReport = report
  },
  SET_USAGE_REPORT(state, report) {
    state.usageReport = report
  },
  SET_ADS_REPORT(state, report) {
    state.adsReport = report
  },
  SET_PLANS(state, plans) {
    state.plans = plans
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // Obtener dashboard
  async fetchDashboard({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.get('/admin/dashboard')

      console.log('[Admin Store] Dashboard response:', response.data)

      if (response.data.success) {
        // El backend envía response.data.dashboard, no response.data.data
        const dashboardData = response.data.dashboard || response.data.data || {}
        commit('SET_DASHBOARD', dashboardData)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar dashboard'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener usuarios
  async fetchUsers({ commit }, filters = {}) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined
      }

      const response = await api.get('/admin/users', { params })

      console.log('[Admin Store] Users response:', response.data)

      if (response.data.success) {
        // 🛡️ Manejo defensivo: asegurar que users siempre sea un array
        const users = response.data.users || response.data.data || []
        const pagination = response.data.pagination || {
          page: params.page,
          limit: params.limit,
          total: Array.isArray(users) ? users.length : 0,
          total_pages: 1
        }

        console.log('[Admin Store] Setting users:', users)
        console.log('[Admin Store] Setting pagination:', pagination)

        commit('SET_USERS', Array.isArray(users) ? users : [])
        commit('SET_USERS_PAGINATION', pagination)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar usuarios'
      commit('SET_ERROR', errorMessage)
      // 🛡️ En caso de error, establecer array vacío para evitar crashes
      commit('SET_USERS', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener detalles de usuario
  async fetchUserDetails({ commit }, userId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.get(`/admin/users/${userId}`)

      if (response.data.success) {
        // El backend devuelve { success, user, statistics, transactions, subscription_history, credits }
        // Estructuramos los datos para el frontend
        const userData = {
          user_info: response.data.user,
          statistics: response.data.statistics,
          transactions: response.data.transactions,
          subscription_history: response.data.subscription_history,
          // Extraer info de suscripción del usuario
          subscription: {
            plan_name: response.data.user?.current_plan,
            plan_display_name: response.data.user?.plan_display_name,
            status: response.data.user?.subscription_status,
            started_at: response.data.user?.subscription_started,
            expires_at: response.data.user?.subscription_expires
          },
          // Créditos del usuario
          credits: response.data.credits || {
            total_credits: 0,
            plan_credits: 0,
            bonus_credits: 0
          }
        }
        commit('SET_SELECTED_USER', userData)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar detalles del usuario'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Actualizar rol de usuario
  async updateUserRole({ commit }, { userId, role }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.put(`/admin/users/${userId}/role`, { role })

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar rol'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Actualizar suscripción de usuario
  async updateUserSubscription({ commit }, { userId, planId }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.put(`/admin/users/${userId}/subscription`, { plan_id: planId })

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar suscripción'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Extender suscripción de usuario
  // NOTA: El backend usa días, no meses, y la ruta es extend-subscription
  async extendSubscription({ commit }, { userId, months, reason }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      // Convertir meses a días (aproximadamente 30 días por mes)
      const days = months * 30

      const response = await api.post(`/admin/users/${userId}/extend-subscription`, {
        days
      })

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al extender suscripción'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Recargar créditos a usuario
  // NOTA: La ruta correcta es /credits/admin/recharge/:userId
  async rechargeUserCredits({ commit }, { userId, credits, type, amount, payment_method, notes }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.post(`/credits/admin/recharge/${userId}`, {
        credits,
        type, // 'plan' o 'bonus'
        amount,
        payment_method,
        notes
      })

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al recargar créditos'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener reporte financiero
  async fetchFinancialReport({ commit }, { startDate, endDate } = {}) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const params = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await api.get('/admin/reports/financial', { params })

      if (response.data.success) {
        commit('SET_FINANCIAL_REPORT', response.data.data)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar reporte financiero'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener reporte de uso
  async fetchUsageReport({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.get('/admin/reports/usage')

      if (response.data.success) {
        commit('SET_USAGE_REPORT', response.data.data)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar reporte de uso'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener reporte de anuncios
  async fetchAdsReport({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.get('/admin/reports/ads')

      if (response.data.success) {
        commit('SET_ADS_REPORT', response.data.data)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar reporte de anuncios'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Obtener planes
  async fetchPlans({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.get('/admin/plans')

      if (response.data.success) {
        commit('SET_PLANS', response.data.plans)
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al cargar planes'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Crear plan
  async createPlan({ commit }, planData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.post('/admin/plans', planData)

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al crear plan'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Actualizar plan
  async updatePlan({ commit }, { planId, planData }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await api.put(`/admin/plans/${planId}`, planData)

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar plan'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Limpiar estado
  clearState({ commit }) {
    commit('SET_DASHBOARD', null)
    commit('SET_USERS', [])
    commit('SET_SELECTED_USER', null)
    commit('SET_FINANCIAL_REPORT', null)
    commit('SET_USAGE_REPORT', null)
    commit('SET_ADS_REPORT', null)
    commit('SET_PLANS', [])
    commit('CLEAR_ERROR')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
