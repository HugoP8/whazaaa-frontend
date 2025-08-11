// src/store/modules/auth.js
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
}

const mutations = {
  SET_USER(state, user) {
    console.log('[Auth Store] SET_USER:', user)
    state.user = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },
  
  SET_TOKEN(state, token) {
    console.log('[Auth Store] SET_TOKEN:', token ? 'Presente' : 'No presente')
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  
  SET_LOADING(state, loading) {
    console.log('[Auth Store] SET_LOADING:', loading)
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    console.log('[Auth Store] SET_ERROR:', error)
    state.error = error
  },
  
  CLEAR_AUTH(state) {
    console.log('[Auth Store] CLEAR_AUTH')
    state.user = null
    state.token = null
    state.error = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

const actions = {
  // Inicializar autenticación al cargar la app
  async init({ commit, dispatch }) {
    console.log('[Auth Store] Inicializando autenticación')
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    
    if (token && user) {
      console.log('[Auth Store] Token y usuario encontrados en localStorage')
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      // Verificar si el token sigue siendo válido
      try {
        await dispatch('verifyToken')
      } catch (error) {
        console.log('[Auth Store] Token inválido, limpiando sesión')
        dispatch('logout')
      }
    } else {
      console.log('[Auth Store] No hay sesión guardada')
    }
  },
  
  // Verificar token
  async verifyToken({ commit, state }) {
    if (!state.token) {
      throw new Error('No hay token para verificar')
    }
    
    try {
      console.log('[Auth Store] Verificando token')
      const response = await api.get('/auth/verify')
      console.log('[Auth Store] Token verificado exitosamente')
      return response.data
    } catch (error) {
      console.error('[Auth Store] Error verificando token:', error)
      commit('CLEAR_AUTH')
      throw error
    }
  },
  
  // Login
  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Auth Store] Intentando login para:', credentials.email)
      const response = await api.post('/auth/login', credentials)
      
      const { user, token } = response.data
      
      if (!user || !token) {
        throw new Error('Respuesta de login inválida')
      }
      
      console.log('[Auth Store] Login exitoso para usuario:', user.email)
      
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
      
      toast.success(`¡Bienvenido, ${user.name}!`)
      
      // Redirigir al dashboard
      if (router.currentRoute.value.name === 'Login') {
        router.push('/dashboard')
      }
      
      return { user, token }
    } catch (error) {
      console.error('[Auth Store] Error en login:', error)
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
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Auth Store] Intentando registro para:', userData.email)
      const response = await api.post('/auth/register', userData)
      
      const { user, token } = response.data
      
      console.log('[Auth Store] Registro exitoso para usuario:', user.email)
      
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
      
      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${user.name}!`)
      
      // Redirigir al dashboard
      router.push('/dashboard')
      
      return { user, token }
    } catch (error) {
      console.error('[Auth Store] Error en registro:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar usuario'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Logout
  async logout({ commit }) {
    try {
      console.log('[Auth Store] Cerrando sesión')
      
      // Intentar cerrar sesión en el servidor
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.warn('[Auth Store] Error cerrando sesión en servidor:', error.message)
        // Continuar con logout local aunque falle en servidor
      }
      
      commit('CLEAR_AUTH')
      toast.success('Sesión cerrada exitosamente')
      
      // Redirigir al login
      if (router.currentRoute.value.name !== 'Login') {
        router.push('/login')
      }
      
    } catch (error) {
      console.error('[Auth Store] Error en logout:', error)
      // Forzar logout local incluso si hay error
      commit('CLEAR_AUTH')
      router.push('/login')
    }
  },
  
  // Actualizar perfil
  async updateProfile({ commit, state }, profileData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Auth Store] Actualizando perfil de usuario:', state.user.id)
      const response = await api.put('/auth/profile', profileData)
      
      const updatedUser = response.data.user
      commit('SET_USER', updatedUser)
      
      toast.success('Perfil actualizado exitosamente')
      return updatedUser
    } catch (error) {
      console.error('[Auth Store] Error actualizando perfil:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar perfil'
      commit('SET_ERROR', errorMessage)
      toast.error(errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Cambiar contraseña
  async changePassword({ commit }, passwordData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Auth Store] Cambiando contraseña')
      await api.put('/auth/change-password', passwordData)
      
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
  // Usuario autenticado
  user: state => {
    console.log('[Auth Store] getter user:', state.user?.email || 'No autenticado')
    return state.user
  },
  
  // Estado de autenticación
  isAuthenticated: state => {
    const isAuth = !!(state.user && state.token)
    console.log('[Auth Store] getter isAuthenticated:', isAuth)
    return isAuth
  },
  
  // ID del usuario (para uso en otros módulos)
  userId: state => {
    const userId = state.user?.id || null
    console.log('[Auth Store] getter userId:', userId)
    return userId
  },
  
  // Token de autenticación
  token: state => {
    console.log('[Auth Store] getter token:', state.token ? 'Presente' : 'No presente')
    return state.token
  },
  
  // Estado de carga
  loading: state => {
    console.log('[Auth Store] getter loading:', state.loading)
    return state.loading
  },
  
  // Error de autenticación
  error: state => {
    console.log('[Auth Store] getter error:', state.error)
    return state.error
  },
  
  // Información del usuario para mostrar
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
  
  // Verificar si el usuario tiene un rol específico
  hasRole: (state) => (role) => {
    if (!state.user) return false
    return state.user.role === role
  },
  
  // Verificar si el usuario es admin
  isAdmin: state => {
    return state.user?.role === 'admin'
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}