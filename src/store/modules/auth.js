// src/store/modules/auth.js
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { whatsappService } from '@/services/whatsappService'

// Secure storage functions
const secureStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from storage:', error)
      return null
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to storage:', error)
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from storage:', error)
    }
  }
}

const toast = useToast()

const state = {
  user: secureStorage.getItem('user'),
  token: secureStorage.getItem('token'),
  membership: secureStorage.getItem('membership'),
  loading: false,
  error: null,
  lastActivity: null,
  initialized: false
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    if (user) {
      secureStorage.setItem('user', user)
    } else {
      secureStorage.removeItem('user')
    }
  },

  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      secureStorage.setItem('token', token)
    } else {
      secureStorage.removeItem('token')
    }
  },

  SET_MEMBERSHIP(state, membership) {
    state.membership = membership
    if (membership) {
      secureStorage.setItem('membership', membership)
    } else {
      secureStorage.removeItem('membership')
    }
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  },

  SET_ERROR(state, error) {
    state.error = error
  },

  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.membership = null
    state.error = null
    secureStorage.removeItem('user')
    secureStorage.removeItem('token')
    secureStorage.removeItem('membership')
  },

  SET_INITIALIZED(state, initialized) {
    state.initialized = initialized
  }
}

const actions = {
  async initialize({ commit, dispatch }) {
    try {
      const token = secureStorage.getItem('token')
      const user = secureStorage.getItem('user')

      if (token && user) {
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        try {
          await dispatch('verifyToken')
        } catch (error) {
          // Solo cerrar sesión si el backend confirmó que el token es inválido/expirado (401).
          // Ante timeout, error de red o 5xx (backend caído/reiniciando) mantenemos la sesión
          // local: se revalidará en la próxima petición real vía el interceptor de api.js.
          if (error.response?.status === 401) {
            commit('CLEAR_AUTH')
          } else {
            console.warn('[Auth] No se pudo verificar el token al iniciar (se mantiene la sesión local):', error.message)
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error en inicialización:', error)
      commit('CLEAR_AUTH')
    } finally {
      commit('SET_INITIALIZED', true)
    }
  },

  async verifyToken({ commit, state }) {
    if (!state.token) throw new Error('No hay token para verificar')
    try {
      const response = await api.get('/auth/verify')
      return response.data
    } catch (error) {
      // Solo limpiar la sesión ante un 401 real. Errores de red/timeout/5xx no significan
      // que el token sea inválido, solo que no se pudo verificar en este momento.
      if (error.response?.status === 401) {
        commit('CLEAR_AUTH')
      }
      throw error
    }
  },

  // Login — acepta { identifier, password } (email o teléfono) o { email, password }
  async login({ commit }, credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Credenciales inválidas')
    }

    const identifier = credentials.identifier || credentials.email
    const { password } = credentials

    if (!identifier || !password) {
      throw new Error('Ingresa tu email o teléfono y contraseña')
    }

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.post('/auth/login', { identifier, password })
      const { user, token } = response.data

      if (!user || !token) {
        throw new Error('Respuesta de login inválida')
      }

      if (user.membership) {
        commit('SET_MEMBERSHIP', user.membership)
      }

      commit('SET_USER', user)
      commit('SET_TOKEN', token)

      toast.success(`¡Bienvenido, ${user.name}!`)

      if (router.currentRoute.value.name === 'Login') {
        router.push('/dashboard')
      }

      return { user, token }
    } catch (error) {
      console.error('[Auth] Error en login:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Register
  async register({ commit }, userData) {
    // Input validation
    if (!userData || typeof userData !== 'object') {
      throw new Error('Datos de registro inválidos')
    }
    
    const { name, email, password, passwordConfirm } = userData
    
    if (!name || !email || !password || !passwordConfirm) {
      throw new Error('Todos los campos son requeridos')
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Por favor ingresa un email válido')
    }
    
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }
    
    if (password !== passwordConfirm) {
      throw new Error('Las contraseñas no coinciden')
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data

      if (user.membership) {
        commit('SET_MEMBERSHIP', user.membership)
      }

      commit('SET_USER', user)
      commit('SET_TOKEN', token)

      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${user.name}!`)
      router.push('/dashboard')

      return { user, token }
    } catch (error) {
      console.error('[Auth] Error en registro:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async logout({ commit }) {
    try {
      try { await api.post('/auth/logout') } catch (e) {}
      // Sin esto el socket de WhatsApp (con todos sus listeners) queda vivo
      // después del logout, colgado hasta que otro usuario inicie sesión.
      try { whatsappService.disconnectSocket() } catch (e) {}
      commit('CLEAR_AUTH')
      toast.success('Sesión cerrada exitosamente')
      if (router.currentRoute.value.name !== 'Login') {
        router.push('/login')
      }
    } catch (error) {
      try { whatsappService.disconnectSocket() } catch (e) {}
      commit('CLEAR_AUTH')
      router.push('/login')
    }
  },

  async fetchProfile({ commit }) {
    try {
      const response = await api.get('/auth/profile')
      if (response.data && response.data.success) {
        const userData = response.data.data
        commit('SET_USER', userData)
        if (userData.membership) {
          commit('SET_MEMBERSHIP', userData.membership)
        }
        return userData
      }
    } catch (error) {
      console.error('[Auth] Error obteniendo perfil:', error)
      throw error
    }
  },

  async updateProfile({ commit }, profileData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await api.put('/auth/profile', profileData)
      const updatedUser = response.data.user

      if (updatedUser.membership) {
        commit('SET_MEMBERSHIP', updatedUser.membership)
      }

      commit('SET_USER', updatedUser)
      toast.success('Perfil actualizado exitosamente')
      return updatedUser
    } catch (error) {
      console.error('[Auth] Error actualizando perfil:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar perfil'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async changePassword({ commit }, passwordData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      await api.put('/auth/password', passwordData)
      
      toast.success('Contraseña actualizada exitosamente')
    } catch (error) {
      console.error('[Auth Store] Error cambiando contraseña:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar contraseña'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Limpiar errores
  clearError({ commit }) {
    commit('SET_ERROR', null)
  }
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => !!(state.user && state.token),
  userId: state => state.user?.id || null,
  token: state => state.token,
  loading: state => state.loading,
  error: state => state.error,

  userDisplayInfo: state => {
    if (!state.user) return null
    return {
      name: state.user.name || 'Usuario',
      email: state.user.email || '',
      avatar: state.user.avatar || null,
      role: state.user.role || 'user',
      createdAt: state.user.createdAt || null
    }
  },

  hasRole: (state) => (role) => {
    if (!state.user) return false
    return state.user.role === role
  },

  isAdmin: state => {
    const role = state.user?.role
    return role === 'admin' || role === 'superadmin'
  },

  isSuperAdmin: state => state.user?.role === 'superadmin',

  isSessionActive: (state) => !!state.token,

  isInitialized: state => state.initialized,

  // Obtener información de membership
  membership: state => {
    return state.membership
  },

  // Verificar si la membership está por vencer
  membershipExpiringSoon: state => {
    return state.membership?.expiringSoon || false
  },

  // Obtener nombre del plan actual
  currentPlan: state => {
    return state.membership?.plan?.displayName || 'Plan Gratuito'
  },

  // Obtener status de la membership
  membershipStatus: state => {
    return state.membership?.statusDisplay || 'N/A'
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}