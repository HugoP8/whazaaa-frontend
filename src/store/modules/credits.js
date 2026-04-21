// src/store/modules/credits.js
import { creditService } from '@/services/creditService'

const state = {
  balance: {
    total_credits: 0,
    plan_credits: 0,
    bonus_credits: 0,
    plan_name: 'free',
    plan_display_name: 'Gratuito',
    plan_started_at: null,
    plan_expires_at: null,
    trial_expires_at: null
  },
  history: [],
  historyPagination: {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  },
  rechargeOptions: [],
  loading: false,
  error: null
}

const getters = {
  balance: (state) => state.balance,
  totalCredits: (state) => state.balance.total_credits,
  planCredits: (state) => state.balance.plan_credits,
  bonusCredits: (state) => state.balance.bonus_credits,
  currentPlan: (state) => state.balance.plan_name,
  currentPlanDisplay: (state) => state.balance.plan_display_name,
  planStartedAt: (state) => state.balance.plan_started_at,
  planExpiresAt: (state) => state.balance.plan_expires_at,
  trialExpiresAt: (state) => state.balance.trial_expires_at,
  history: (state) => state.history,
  rechargeOptions: (state) => state.rechargeOptions,
  loading: (state) => state.loading,
  error: (state) => state.error,

  // Helper para saber si tiene créditos suficientes
  hasEnoughCredits: (state) => (required) => {
    return state.balance.total_credits >= required
  },

  // Helper para saber si está en créditos bajos
  isLowCredits: (state) => {
    return state.balance.total_credits <= 5
  }
}

const mutations = {
  SET_BALANCE(state, balance) {
    state.balance = {
      ...state.balance,
      ...balance
    }
  },

  SET_HISTORY(state, history) {
    state.history = history
  },

  SET_HISTORY_PAGINATION(state, pagination) {
    state.historyPagination = pagination
  },

  SET_RECHARGE_OPTIONS(state, options) {
    state.rechargeOptions = options
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  CLEAR_ERROR(state) {
    state.error = null
  },

  // Actualizar créditos después de usar
  DEDUCT_CREDITS(state, amount) {
    state.balance.total_credits -= amount
    // Primero consumir bonus, luego plan credits
    if (state.balance.bonus_credits >= amount) {
      state.balance.bonus_credits -= amount
    } else {
      const remaining = amount - state.balance.bonus_credits
      state.balance.bonus_credits = 0
      state.balance.plan_credits -= remaining
    }
  },

  // Agregar créditos
  ADD_CREDITS(state, { plan_credits = 0, bonus_credits = 0 }) {
    state.balance.plan_credits += plan_credits
    state.balance.bonus_credits += bonus_credits
    state.balance.total_credits += (plan_credits + bonus_credits)
  }
}

const actions = {
  /**
   * Obtener balance actual
   */
  async fetchBalance({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await creditService.getMyBalance()

      if (response.success) {
        commit('SET_BALANCE', response.balance)
      }

      return response
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al obtener balance'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * Obtener historial de uso
   */
  async fetchHistory({ commit }, params = {}) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await creditService.getMyHistory(params)

      if (response.success) {
        commit('SET_HISTORY', response.history || [])
        if (response.pagination) {
          commit('SET_HISTORY_PAGINATION', response.pagination)
        }
      }

      return response
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al obtener historial'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * Obtener opciones de recarga
   */
  async fetchRechargeOptions({ commit }) {
    try {
      const response = await creditService.getRechargeOptions()

      if (response.success) {
        commit('SET_RECHARGE_OPTIONS', response.options || [])
      }

      return response
    } catch (error) {
      console.error('Error fetching recharge options:', error)
      throw error
    }
  },

  /**
   * Solicitar recarga
   */
  async requestRecharge({ commit, dispatch }, data) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')

      const response = await creditService.requestRecharge(data)

      // Refrescar balance después de solicitud exitosa
      if (response.success) {
        await dispatch('fetchBalance')
      }

      return response
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al solicitar recarga'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * Limpiar estado
   */
  clearState({ commit }) {
    commit('SET_BALANCE', {
      total_credits: 0,
      plan_credits: 0,
      bonus_credits: 0,
      plan_name: 'free',
      plan_display_name: 'Gratuito',
      plan_started_at: null,
      plan_expires_at: null,
      trial_expires_at: null
    })
    commit('SET_HISTORY', [])
    commit('SET_RECHARGE_OPTIONS', [])
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
