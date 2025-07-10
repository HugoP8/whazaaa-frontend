import { createStore } from 'vuex'
import auth from './modules/auth'
import campaigns from './modules/campaigns'
import whatsapp from './modules/whatsapp'

export default createStore({
  modules: {
    auth,
    campaigns,
    whatsapp
  },
  
  state: {
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    error: state => state.error
  }
})