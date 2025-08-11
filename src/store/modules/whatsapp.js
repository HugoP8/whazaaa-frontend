import { whatsappService } from '@/services/whatsappService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const state = {
  connected: false,
  connecting: false,
  qrCode: null,
  contacts: [],
  groups: [],
  socket: null,
  connectionInfo: null,
  connectionError: null
}

const mutations = {
  SET_CONNECTED(state, connected) {
    console.log('[WhatsApp Store] SET_CONNECTED:', connected)
    state.connected = connected
  },
  
  SET_CONNECTING(state, connecting) {
    console.log('[WhatsApp Store] SET_CONNECTING:', connecting)
    state.connecting = connecting
  },
  
  SET_QR_CODE(state, qrCode) {
    console.log('[WhatsApp Store] SET_QR_CODE:', qrCode ? 'Presente' : 'No presente')
    state.qrCode = qrCode
  },
  
  SET_CONNECTION_INFO(state, info) {
    console.log('[WhatsApp Store] SET_CONNECTION_INFO:', info)
    state.connectionInfo = info
  },
  
  SET_SOCKET(state, socket) {
    console.log('[WhatsApp Store] SET_SOCKET:', socket ? 'Presente' : 'No presente')
    state.socket = socket
  },
  
  SET_CONNECTION_ERROR(state, error) {
    console.log('[WhatsApp Store] SET_CONNECTION_ERROR:', error)
    state.connectionError = error
  },
  
  SET_CONTACTS(state, contacts) {
    console.log('[WhatsApp Store] SET_CONTACTS:', contacts.length, 'contactos')
    state.contacts = contacts
  },
  
  SET_GROUPS(state, groups) {
    console.log('[WhatsApp Store] SET_GROUPS:', groups.length, 'grupos')
    state.groups = groups
  }
}

const actions = {
  async connect({ commit, rootState, state }) {
    console.log('[WhatsApp Store] Ejecutando acción connect')
    
    if (state.connecting) {
      console.log('[WhatsApp Store] Ya se está conectando, ignorando nueva solicitud')
      return
    }
    
    commit('SET_CONNECTING', true)
    commit('SET_CONNECTION_ERROR', null)
    commit('SET_QR_CODE', null) // Limpiar QR anterior
    
    try {
      const userId = rootState.auth.user?.id
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      console.log(`[WhatsApp Store] Iniciando conexión para userId: ${userId}`)
      
      // 1. Configurar socket PRIMERO
      const socket = whatsappService.connectSocket(userId)
      console.log('[WhatsApp Store] Socket creado')
      
      // 2. Configurar listeners de socket ANTES de conectar
      socket.on(`qr-${userId}`, (data) => {
        console.log(`[WhatsApp Store] Evento QR recibido para userId: ${userId}`, data)
        
        // El backend puede enviar { qrCode, userId } o solo el qrCode
        const qrCodeData = typeof data === 'string' ? data : data.qrCode
        
        if (qrCodeData) {
          commit('SET_QR_CODE', qrCodeData)
          console.log('[WhatsApp Store] QR Code establecido en el estado')
        } else {
          console.error('[WhatsApp Store] QR Code no válido recibido:', data)
        }
      })
      
      socket.on(`connection-status-${userId}`, (status) => {
        console.log(`[WhatsApp Store] Evento connection-status para userId: ${userId}`, status)
        commit('SET_CONNECTED', status.connected)
        
        if (status.connected) {
          commit('SET_QR_CODE', null) // Limpiar QR cuando se conecta
          commit('SET_CONNECTION_INFO', status.user)
          toast.success('WhatsApp conectado exitosamente')
        } else if (status.error) {
          commit('SET_CONNECTION_ERROR', status.error)
          toast.error(`Error de conexión: ${status.error}`)
        }
      })
      
      socket.on('connect', () => {
        console.log('[WhatsApp Store] Socket conectado')
        commit('SET_SOCKET', socket)
      })
      
      socket.on('disconnect', (reason) => {
        console.log('[WhatsApp Store] Socket desconectado:', reason)
        commit('SET_CONNECTED', false)
        commit('SET_QR_CODE', null)
      })
      
      socket.on('connect_error', (error) => {
        console.error('[WhatsApp Store] Error en socket:', error)
        commit('SET_CONNECTION_ERROR', error.message)
        toast.error('Error conectando con el servidor de WhatsApp')
      })
      
      // 3. Esperar conexión inicial del socket
      await new Promise((resolve, reject) => {
        if (socket.connected) {
          console.log('[WhatsApp Store] Socket ya estaba conectado')
          resolve()
        } else {
          console.log('[WhatsApp Store] Esperando conexión del socket...')
          
          const timeout = setTimeout(() => {
            reject(new Error('Tiempo de espera agotado para conexión del socket'))
          }, 15000)
          
          socket.once('connect', () => {
            clearTimeout(timeout)
            console.log('[WhatsApp Store] Socket conectado después de espera')
            resolve()
          })
          
          socket.once('connect_error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        }
      })
      
      // 4. AHORA conectar con el servicio de WhatsApp (esto generará el QR)
      await whatsappService.connect()
      console.log('[WhatsApp Store] Servicio WhatsApp conectado - esperando QR...')
      
      console.log('[WhatsApp Store] Conexión completada con éxito')
      
    } catch (error) {
      console.error('[WhatsApp Store] Error en acción connect:', error)
      commit('SET_CONNECTION_ERROR', error.message)
      toast.error(error.message || 'Error al conectar WhatsApp')
      throw error
    } finally {
      commit('SET_CONNECTING', false)
    }
  },
  
  async disconnect({ commit, state }) {
    console.log('[WhatsApp Store] Ejecutando acción disconnect')
    try {
      await whatsappService.disconnect()
      
      if (state.socket) {
        whatsappService.disconnectSocket()
        commit('SET_SOCKET', null)
      }
      
      commit('SET_CONNECTED', false)
      commit('SET_QR_CODE', null)
      commit('SET_CONNECTION_INFO', null)
      commit('SET_CONNECTION_ERROR', null)
      toast.success('WhatsApp desconectado')
      
    } catch (error) {
      console.error('[WhatsApp Store] Error al desconectar:', error)
      toast.error('Error al desconectar WhatsApp')
      throw error
    }
  },
  
  async checkStatus({ commit }) {
    console.log('[WhatsApp Store] Verificando estado de WhatsApp')
    try {
      const status = await whatsappService.getStatus()
      console.log('[WhatsApp Store] Estado recibido:', status)
      commit('SET_CONNECTED', status.connected)
      commit('SET_CONNECTION_INFO', status.user)
      return status
    } catch (error) {
      console.error('[WhatsApp Store] Error verificando estado:', error)
      commit('SET_CONNECTED', false)
      return { connected: false }
    }
  },
  
  async fetchContacts({ commit }) {
    console.log('[WhatsApp Store] Obteniendo contactos')
    try {
      const contacts = await whatsappService.getContacts()
      commit('SET_CONTACTS', contacts)
      return contacts
    } catch (error) {
      console.error('[WhatsApp Store] Error obteniendo contactos:', error)
      toast.error('Error al cargar contactos')
      throw error
    }
  },
  
  async fetchGroups({ commit }) {
    console.log('[WhatsApp Store] Obteniendo grupos')
    try {
      const groups = await whatsappService.getGroups()
      commit('SET_GROUPS', groups)
      return groups
    } catch (error) {
      console.error('[WhatsApp Store] Error obteniendo grupos:', error)
      toast.error('Error al cargar grupos')
      throw error
    }
  },
  
  async syncContacts({ dispatch }) {
    console.log('[WhatsApp Store] Sincronizando contactos')
    try {
      await whatsappService.syncContacts()
      await dispatch('fetchContacts')
      toast.success('Contactos sincronizados')
    } catch (error) {
      console.error('[WhatsApp Store] Error sincronizando contactos:', error)
      toast.error('Error al sincronizar contactos')
      throw error
    }
  }
}

const getters = {
  isConnected: state => {
    console.log('[WhatsApp Store] getter isConnected:', state.connected)
    return state.connected
  },
  isConnecting: state => {
    console.log('[WhatsApp Store] getter isConnecting:', state.connecting)
    return state.connecting
  },
  qrCode: state => {
    console.log('[WhatsApp Store] getter qrCode:', state.qrCode ? 'Presente' : 'No presente')
    return state.qrCode
  },
  contacts: state => {
    console.log('[WhatsApp Store] getter contacts:', state.contacts.length, 'contactos')
    return state.contacts
  },
  groups: state => {
    console.log('[WhatsApp Store] getter groups:', state.groups.length, 'grupos')
    return state.groups
  },
  connectionInfo: state => {
    console.log('[WhatsApp Store] getter connectionInfo:', state.connectionInfo)
    return state.connectionInfo
  },
  connectionError: state => {
    console.log('[WhatsApp Store] getter connectionError:', state.connectionError)
    return state.connectionError
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}