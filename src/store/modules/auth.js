// src/store/modules/auth.js
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import router from '@/router'

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
    console.log('[Auth Store] SET_USER:', user)
    console.log('[Auth Store] SET_USER - role:', user?.role)
    state.user = user
    if (user) {
      secureStorage.setItem('user', user)
      console.log('[Auth Store] Usuario guardado en localStorage')
      console.log('[Auth Store] Verificando localStorage:', JSON.parse(localStorage.getItem('user')))
    } else {
      secureStorage.removeItem('user')
    }
  },

  SET_TOKEN(state, token) {
    console.log('[Auth Store] SET_TOKEN:', token ? 'Presente' : 'No presente')
    state.token = token
    if (token) {
      secureStorage.setItem('token', token)
    } else {
      secureStorage.removeItem('token')
    }
  },

  SET_MEMBERSHIP(state, membership) {
    console.log('[Auth Store] SET_MEMBERSHIP:', membership)
    state.membership = membership
    if (membership) {
      secureStorage.setItem('membership', membership)
    } else {
      secureStorage.removeItem('membership')
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
    state.membership = null
    state.error = null
    secureStorage.removeItem('user')
    secureStorage.removeItem('token')
    secureStorage.removeItem('membership')
  },

  SET_INITIALIZED(state, initialized) {
    console.log('[Auth Store] SET_INITIALIZED:', initialized)
    state.initialized = initialized
  }
}

const actions = {
  // Inicializar autenticación al cargar la app
  async initialize({ commit, dispatch }) {
    console.log('[Auth Store] Inicializando autenticación')
    
    try {
      const token = secureStorage.getItem('token')
      const user = secureStorage.getItem('user')
      
      if (token && user) {
        console.log('[Auth Store] Token y usuario encontrados en localStorage')
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        
        // Verificar si el token sigue siendo válido
        try {
          await dispatch('verifyToken')
          console.log('[Auth Store] Token válido - sesión restaurada')
        } catch (error) {
          console.log('[Auth Store] Token inválido, limpiando sesión')
          commit('CLEAR_AUTH')
        }
      } else {
        console.log('[Auth Store] No hay sesión guardada')
      }
    } catch (error) {
      console.error('[Auth Store] Error en inicialización:', error)
      commit('CLEAR_AUTH')
    } finally {
      commit('SET_INITIALIZED', true)
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
    // Input validation
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Credenciales inválidas')
    }
    
    const { email, password } = credentials
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos')
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Por favor ingresa un email válido')
    }
    
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }
    
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      console.log('[Auth Store] Intentando login para:', credentials.email)
      const response = await api.post('/auth/login', credentials)

      console.log('[Auth Store] Respuesta completa del backend:', response.data)

      const { user, token } = response.data

      if (!user || !token) {
        throw new Error('Respuesta de login inválida')
      }

      console.log('[Auth Store] Login exitoso para usuario:', user.email)
      console.log('[Auth Store] Usuario completo:', user)
      console.log('[Auth Store] Campo role:', user.role)
      console.log('[Auth Store] Tipo de role:', typeof user.role)

      // Guardar membership si viene en la respuesta
      if (user.membership) {
        console.log('[Auth Store] Membership recibida:', user.membership)
        commit('SET_MEMBERSHIP', user.membership)
      }

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
      console.log('[Auth Store] Intentando registro para:', userData.email)
      const response = await api.post('/auth/register', userData)
      
      const { user, token } = response.data

      console.log('[Auth Store] Registro exitoso para usuario:', user.email)

      // Guardar membership si viene en la respuesta
      if (user.membership) {
        console.log('[Auth Store] Membership recibida en registro:', user.membership)
        commit('SET_MEMBERSHIP', user.membership)
      }

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
  
  // Obtener perfil completo con membership
  async fetchProfile({ commit }) {
    try {
      console.log('[Auth Store] Obteniendo perfil completo')
      const response = await api.get('/auth/profile')

      if (response.data && response.data.success) {
        const userData = response.data.data
        commit('SET_USER', userData)

        // Actualizar membership si viene en la respuesta
        if (userData.membership) {
          console.log('[Auth Store] Actualizando membership desde perfil:', userData.membership)
          commit('SET_MEMBERSHIP', userData.membership)
        }

        return userData
      }
    } catch (error) {
      console.error('[Auth Store] Error obteniendo perfil:', error)
      throw error
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

      // Actualizar membership si viene en la respuesta
      if (updatedUser.membership) {
        console.log('[Auth Store] Actualizando membership desde update:', updatedUser.membership)
        commit('SET_MEMBERSHIP', updatedUser.membership)
      }

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

// Inactivity timer
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

const startInactivityTimer = (commit) => {
  // Reset timer on user activity
  const resetTimer = () => {
    if (window.inactivityTimer) {
      clearTimeout(window.inactivityTimer)
    }
    
    window.inactivityTimer = setTimeout(() => {
      commit('CLEAR_AUTH')
      router.push('/login')
      toast.info('Has sido desconectado por inactividad')
    }, INACTIVITY_TIMEOUT)
  }
  
  // Set up event listeners
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  events.forEach(event => {
    document.removeEventListener(event, resetTimer)
    document.addEventListener(event, resetTimer, { passive: true })
  })
  
  return resetTimer
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
    const role = state.user?.role
    const isAdminRole = role === 'admin' || role === 'superadmin'
    console.log('[Auth Store Getter isAdmin]', {
      user: state.user?.email,
      role: role,
      isAdmin: isAdminRole
    })
    return isAdminRole
  },

  // Verificar si el usuario es superadmin
  isSuperAdmin: state => {
    return state.user?.role === 'superadmin'
  },
  
  // Verificar si la sesión está activa
  isSessionActive: (state) => {
    if (!state.token) return false
    // Add additional checks if needed
    return true
  },
  
  // Verificar si el auth store está inicializado
  isInitialized: state => {
    console.log('[Auth Store] getter isInitialized:', state.initialized)
    return state.initialized
  },

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