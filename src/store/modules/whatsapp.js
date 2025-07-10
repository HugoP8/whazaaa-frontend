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
  connectionInfo: null
}

const mutations = {
  SET_CONNECTED(state, connected) {
    state.connected = connected
  },
  
  SET_CONNECTING(state, connecting) {
    state.connecting = connecting
  },
  
  SET_QR_CODE(state, qrCode) {
    state.qrCode = qrCode
  },
  
  SET_CONTACTS(state, contacts) {
    state.contacts = contacts
  },
  
  SET_GROUPS(state, groups) {
    state.groups = groups
  },
  
  SET_SOCKET(state, socket) {
    state.socket = socket
  },
  
  SET_CONNECTION_INFO(state, info) {
    state.connectionInfo = info
  }
}

const actions = {
  async connect({ commit, rootState }) {
    commit('SET_CONNECTING', true)
    try {
      await whatsappService.connect()
      
      // Conectar socket
      const userId = rootState.auth.user.id
      const socket = whatsappService.connectSocket(userId)
      
      // Escuchar eventos del socket
      socket.on(`qr-${userId}`, (qrCode) => {
        commit('SET_QR_CODE', qrCode)
      })
      
      socket.on(`connection-status-${userId}`, (status) => {
        commit('SET_CONNECTED', status.connected)
        if (status.connected) {
          commit('SET_QR_CODE', null)
          toast.success('WhatsApp conectado exitosamente')
        }
      })
      
      socket.on(`new-message-${userId}`, (message) => {
        console.log('Nuevo mensaje:', message)
      })
      
      socket.on(`message-progress-${userId}`, (progress) => {
        console.log('Progreso:', progress)
      })
      
      commit('SET_SOCKET', socket)
      
    } catch (error) {
      toast.error('Error al conectar WhatsApp')
      throw error
    } finally {
      commit('SET_CONNECTING', false)
    }
  },
  
  async disconnect({ commit, state }) {
    try {
      await whatsappService.disconnect()
      
      if (state.socket) {
        whatsappService.disconnectSocket()
        commit('SET_SOCKET', null)
      }
      
      commit('SET_CONNECTED', false)
      commit('SET_QR_CODE', null)
      toast.success('WhatsApp desconectado')
      
    } catch (error) {
      toast.error('Error al desconectar WhatsApp')
      throw error
    }
  },
  
  async checkStatus({ commit }) {
    try {
      const status = await whatsappService.getStatus()
      commit('SET_CONNECTED', status.connected)
      commit('SET_CONNECTION_INFO', status.user)
      return status
    } catch (error) {
      console.error('Error verificando estado:', error)
      return { connected: false }
    }
  },
  
  async fetchContacts({ commit }) {
    try {
      const contacts = await whatsappService.getContacts()
      commit('SET_CONTACTS', contacts)
      return contacts
    } catch (error) {
      toast.error('Error al cargar contactos')
      throw error
    }
  },
  
  async fetchGroups({ commit }) {
    try {
      const groups = await whatsappService.getGroups()
      commit('SET_GROUPS', groups)
      return groups
    } catch (error) {
      toast.error('Error al cargar grupos')
      throw error
    }
  },
  
  async syncContacts({ dispatch }) {
    try {
      await whatsappService.syncContacts()
      await dispatch('fetchContacts')
      toast.success('Contactos sincronizados')
    } catch (error) {
      toast.error('Error al sincronizar contactos')
      throw error
    }
  }
}

const getters = {
  isConnected: state => state.connected,
  isConnecting: state => state.connecting,
  qrCode: state => state.qrCode,
  contacts: state => state.contacts,
  groups: state => state.groups,
  connectionInfo: state => state.connectionInfo
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}