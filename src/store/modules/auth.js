import { authService } from '@/services/authService'
import router from '@/router'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    state.isAuthenticated = !!token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

const actions = {
  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    try {
      const response = await authService.login(credentials)
      commit('SET_TOKEN', response.token)
      commit('SET_USER', response.user)
      toast.success('¡Bienvenido!')
      router.push('/dashboard')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async register({ commit }, userData) {
    commit('SET_LOADING', true)
    try {
      const response = await authService.register(userData)
      commit('SET_TOKEN', response.token)
      commit('SET_USER', response.user)
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/dashboard')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al registrar')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async getProfile({ commit }) {
    try {
      const user = await authService.getProfile()
      commit('SET_USER', user)
      return user
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  },
  
  async updateProfile({ commit }, data) {
    try {
      const user = await authService.updateProfile(data)
      commit('SET_USER', user)
      toast.success('Perfil actualizado')
      return user
    } catch (error) {
      toast.error('Error al actualizar perfil')
      throw error
    }
  },
  
  async changePassword({ commit }, data) {
    try {
      await authService.changePassword(data)
      toast.success('Contraseña actualizada')
    } catch (error) {
      toast.error('Error al cambiar contraseña')
      throw error
    }
  },
  
  logout({ commit }) {
    authService.logout()
    commit('LOGOUT')
    router.push('/login')
    toast.info('Sesión cerrada')
  }
}

const getters = {
  currentUser: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  authLoading: state => state.loading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}