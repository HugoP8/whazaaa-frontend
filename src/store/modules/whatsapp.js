import { whatsappService } from '@/services/whatsappService'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Evitar spam de toasts: solo mostrar si el estado realmente cambió
let _lastConnectedState = null
let _lastReauthToastTime = 0
let _lastErrorToastTime = 0
function _notifyConnected() {
  if (_lastConnectedState === true) return
  _lastConnectedState = true
  toast.success('WhatsApp conectado', { timeout: 3000 })
}
function _notifyDisconnected(msg) {
  if (_lastConnectedState === false) return
  _lastConnectedState = false
  toast.warning(msg, { timeout: 3000 })
}
function _notifyReauth() {
  const now = Date.now()
  if (now - _lastReauthToastTime < 10000) return
  _lastReauthToastTime = now
  _lastConnectedState = false
  toast.warning('Sesión expirada. Escanea el QR.', { timeout: 4000 })
}
function _notifyError(msg) {
  const now = Date.now()
  if (now - _lastErrorToastTime < 8000) return
  _lastErrorToastTime = now
  toast.error(msg, { timeout: 4000 })
}

// Socket event handlers
const createSocketEventHandlers = (commit, userId, cleanup) => {
  const handlers = {
    qr: (data) => {
      console.log(`[WhatsApp Store] Evento QR recibido para userId: ${userId}`, data)
      const qrCodeData = typeof data === 'string' ? data : data?.qrCode
      
      if (qrCodeData) {
        commit('SET_QR_CODE', qrCodeData)
        console.log('[WhatsApp Store] QR Code establecido en el estado')
      } else {
        console.error('[WhatsApp Store] QR Code no válido recibido:', data)
      }
    },
    
    connectionStatus: (status) => {
      console.log(`[WhatsApp Store] Evento connection-status para userId: ${userId}`, status)
      commit('SET_CONNECTION_INFO', status)

      if (status.connected) {
        commit('SET_CONNECTED', true)
        commit('SET_QR_CODE', null)
        _notifyConnected()
      } else if (status.qr) {
        commit('SET_QR_CODE', status.qr)
      }
    },

    error: (error) => {
      console.error(`[WhatsApp Store] Error en socket para userId ${userId}:`, error)
      commit('SET_CONNECTION_ERROR', error.message || 'Error de conexión')
      _notifyError(error.message || 'Error en la conexión de WhatsApp')
    }
  }
  
  // Return cleanup function
  return (socket) => {
    if (!socket) return
    
    // Remove all event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.off(`${event}-${userId}`, handler)
    })
    
    // Additional cleanup if needed
    if (cleanup) {
      cleanup()
    }
  }
}

const state = {
  connected: false,
  connecting: false,
  qrCode: null,
  contacts: [],
  groups: [],
  socket: null,
  connectionInfo: null,
  connectionError: null,
  cleanupSocket: null, // Store cleanup function
  campaignProgress: null, // Para tracking de progreso en tiempo real
  todayMessagesCount: 0, // Contador de mensajes enviados hoy
  monthlyLimit: 300 // Límite mensual de mensajes
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
  
  SET_CLEANUP(state, cleanup) {
    console.log('[WhatsApp Store] SET_CLEANUP:', cleanup ? 'Función establecida' : 'Limpieza completada')
    state.cleanupSocket = cleanup
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
  },
  
  MESSAGE_SENT(state, data) {
    console.log('[WhatsApp Store] MESSAGE_SENT:', data)
    // Incrementar contador de mensajes del día
    state.todayMessagesCount += 1
  },
  
  MESSAGE_FAILED(state, data) {
    console.log('[WhatsApp Store] MESSAGE_FAILED:', data)
    // Aquí puedes manejar mensajes fallidos
  },
  
  CAMPAIGN_PROGRESS(state, data) {
    console.log('[WhatsApp Store] CAMPAIGN_PROGRESS:', data)
    state.campaignProgress = data
  },

  SET_CAMPAIGN_PROGRESS(state, progress) {
    state.campaignProgress = progress
  },

  // Atomic: set connected=false AND connecting=true in one commit to prevent
  // QRCode from mounting and calling connect() while backend is already reconnecting
  SET_RECONNECTING(state) {
    state.connected = false
    state.connecting = true
  },

  CONNECTION_STATUS_UPDATE(state, status) {
    console.log('[WhatsApp Store] CONNECTION_STATUS_UPDATE:', status)
    if (status.connected) {
      state.connected = true
      state.connectionError = null
    } else {
      state.connected = false
    }
    state.connectionInfo = status
  },

  SET_TODAY_MESSAGES_COUNT(state, count) {
    console.log('[WhatsApp Store] SET_TODAY_MESSAGES_COUNT:', count)
    state.todayMessagesCount = count
  },

  INCREMENT_TODAY_MESSAGES(state) {
    state.todayMessagesCount += 1
    console.log('[WhatsApp Store] INCREMENT_TODAY_MESSAGES:', state.todayMessagesCount)
  },

  SET_MONTHLY_LIMIT(state, limit) {
    console.log('[WhatsApp Store] SET_MONTHLY_LIMIT:', limit)
    state.monthlyLimit = limit
  }
}

const actions = {
  async connect({ commit, dispatch, rootState, state }) {
    console.log('[WhatsApp Store] Ejecutando acción connect')
    
    if (state.connecting) {
      console.log('[WhatsApp Store] Ya se está conectando, ignorando nueva solicitud')
      return
    }
    
    commit('SET_CONNECTING', true)
    commit('SET_CONNECTION_ERROR', null)
    commit('SET_QR_CODE', null)
    
    try {
      const userId = rootState.auth.user?.id
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      console.log(`[WhatsApp Store] Iniciando conexión para userId: ${userId}`)
      
      // Configurar manejadores de eventos
      const eventHandlers = {
        onQR: (qrData) => {
          console.log('[WhatsApp Store] QR recibido:', qrData)
          
          // El backend envía {qr: 'data:image...', userId: 1, timestamp: '...'}
          // Necesitamos extraer solo el string del QR
          const qrString = typeof qrData === 'string' ? qrData : qrData.qr || qrData
          
          console.log('[WhatsApp Store] QR string extraído:', qrString ? 'Presente' : 'No presente')
          commit('SET_QR_CODE', qrString)
        },
        
        onConnectionStatus: (status) => {
          console.log('[WhatsApp Store] Estado de conexión:', status)

          if (status.connected) {
            // Conexión establecida exitosamente
            commit('SET_CONNECTED', true)
            commit('SET_CONNECTING', false)
            commit('SET_QR_CODE', null)
            commit('SET_CONNECTION_INFO', status.user || status)
            commit('SET_CONNECTION_ERROR', null)
            _notifyConnected()
          } else if (status.requiresReauth) {
            // Sesión destruida (Bad MAC / loggedOut) - necesita nuevo QR
            console.warn('[WhatsApp Store] Sesión destruida - se requiere nuevo QR')
            commit('SET_CONNECTED', false)
            commit('SET_QR_CODE', null)
            commit('SET_CONNECTING', false)
            commit('SET_CONNECTION_INFO', null)
            _notifyReauth()
            // Solicitar nuevo QR - con guardia para no crear loop
            setTimeout(() => {
              if (!state.connecting) dispatch('connect')
            }, 2000)
          } else if (status.reconnecting || status.status === 'connecting') {
            // Backend reconectando automáticamente - mostrar estado "conectando"
            console.log('[WhatsApp Store] Reconectando automáticamente...')
            commit('SET_CONNECTED', false)
            commit('SET_CONNECTING', true)
          } else if (status.qr) {
            // Backend enviando QR directamente en el status (caso especial)
            commit('SET_QR_CODE', status.qr)
          } else {
            // Desconectado definitivamente (sin reconexión automática)
            console.warn('[WhatsApp Store] Desconectado sin reconexión automática')
            commit('SET_CONNECTED', false)
            commit('SET_CONNECTING', false)
          }
        },
        
        onError: (error) => {
          console.error('[WhatsApp Store] Error:', error)

          const errorMessage = error.message || error
          commit('SET_CONNECTION_ERROR', errorMessage)

          // NOTA: NO disparamos dispatch('connect') desde aquí.
          // El backend maneja su propia reconexión automática con backoff exponencial.
          // Cuando se reconecte, emitirá 'connection-status' → el handler de arriba actualizará el estado.
          // Disparar connect() desde el frontend duplica sockets → conflicto 440 → más desconexiones → loop.
          _notifyError(errorMessage || 'Error en WhatsApp')
        },
        
        onMessageSent: (data) => {
          console.log('[WhatsApp Store] Mensaje enviado:', data)
          // Emitir evento para actualizar estadísticas
          commit('MESSAGE_SENT', data)
        },
        
        onMessageFailed: (data) => {
          console.log('[WhatsApp Store] Mensaje falló:', data)
          commit('MESSAGE_FAILED', data)
        },
        
        onCampaignProgress: (data) => {
          console.log('[WhatsApp Store] Progreso campaña:', data)
          commit('CAMPAIGN_PROGRESS', data)
        },

        onCampaignCompleted: (data) => {
          console.log('[WhatsApp Store] Campaña completada:', data)
          // Emitir evento global para que los componentes puedan reaccionar
          document.dispatchEvent(new CustomEvent('campaign-completed', { detail: data }))
        },

        onCampaignError: (data) => {
          console.log('[WhatsApp Store] Error en campaña:', data)
          // El backend maneja su propia reconexión - solo emitir evento para la UI
          document.dispatchEvent(new CustomEvent('campaign-error', { detail: data }))
        }
      }
      
      // Conectar socket con manejadores
      const socket = whatsappService.connectSocket(userId, eventHandlers)
      commit('SET_SOCKET', socket)
      
      // Esperar conexión del socket
      await new Promise((resolve, reject) => {
        if (socket.connected) {
          resolve()
        } else {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout conectando socket'))
          }, 15000)
          
          socket.once('connect', () => {
            clearTimeout(timeout)
            resolve()
          })
          
          socket.once('connect_error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        }
      })
      
      // Iniciar conexión WhatsApp
      const connectResponse = await whatsappService.connect()
      console.log('[WhatsApp Store] Conexión iniciada')

      // Backend ya está reconectando automáticamente — no cambiar estado
      if (connectResponse.message?.includes('Reconexión en progreso')) {
        console.log('[WhatsApp Store] Backend reconectando automáticamente, mantener estado connecting')
        commit('SET_CONNECTING', true) // ensure UI shows reconnecting
        return
      }

      // Si ya estaba conectado, procesar el estado recibido
      if (connectResponse.status && connectResponse.message?.includes('Ya está conectado')) {
        console.log('[WhatsApp Store] Usuario ya conectado, procesando estado:', connectResponse.status)
        const status = connectResponse.status

        // Validar estado real: solo conectado si state==='connected' Y hay usuario
        const isReallyConnected = status.state === 'connected' && status.user !== null

        commit('SET_CONNECTED', isReallyConnected)
        commit('SET_CONNECTION_INFO', status.user || status.connectionInfo)

        if (isReallyConnected) {
          commit('SET_CONNECTION_ERROR', null)
          commit('SET_QR_CODE', null)
          commit('SET_CONNECTING', false)
          return
        }

        // Backend dice "ya conectado" pero no está realmente → limpiar connecting
        // para que el socket handler pueda actualizar el estado correctamente
        commit('SET_CONNECTING', false)
        return
      }

    } catch (error) {
      console.error('[WhatsApp Store] Error conectando:', error)
      commit('SET_CONNECTION_ERROR', error.message)
      commit('SET_CONNECTING', false)
      _notifyError(error.message || 'Error al conectar WhatsApp')
      throw error
    }
    // NOTE: SET_CONNECTING(false) es manejado por socket events:
    //   connection-status.connected=true  → SET_CONNECTING(false)
    //   connection-status.reconnecting=true → SET_CONNECTING(true)
    //   Desconexión definitiva → SET_CONNECTING(false)
  },
  
  async disconnect({ commit, state }) {
    console.log('[WhatsApp Store] Ejecutando acción disconnect')
    // Resetear para que la próxima conexión muestre toast
    _lastConnectedState = null
    
    // Ejecutar limpieza si existe
    if (state.cleanupSocket) {
      console.log('[WhatsApp Store] Ejecutando limpieza de socket')
      state.cleanupSocket()
      commit('SET_CLEANUP', null)
    }
    
    if (!state.socket) {
      console.log('[WhatsApp Store] No hay conexión activa para desconectar')
      return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      console.log('[WhatsApp Store] Desconectando socket')
      
      // Manejar el evento de desconexión
      const onDisconnect = () => {
        console.log('[WhatsApp Store] Socket desconectado exitosamente')
        commit('SET_CONNECTED', false)
        commit('SET_QR_CODE', null)
        commit('SET_CONNECTION_INFO', null)
        commit('SET_SOCKET', null)
        resolve()
      }
      
      // Configurar timeout para la desconexión
      const disconnectTimeout = setTimeout(() => {
        console.warn('[WhatsApp Store] Timeout al desconectar, forzando')
        state.socket.off('disconnect', onDisconnect)
        commit('SET_SOCKET', null)
        resolve()
      }, 5000) // 5 segundos de timeout
      
      // Configurar manejador de desconexión
      state.socket.once('disconnect', () => {
        clearTimeout(disconnectTimeout)
        onDisconnect()
      })
      
      // Iniciar desconexión
      try {
        state.socket.disconnect()
      } catch (error) {
        console.error('[WhatsApp Store] Error al desconectar:', error)
        commit('SET_CONNECTION_ERROR', error.message || 'Error al desconectar')
        reject(error)
      }
    })
  },
  
  async checkStatus({ commit }) {
    console.log('[WhatsApp Store] Verificando estado de WhatsApp')
    try {
      const status = await whatsappService.syncConnectionStatus()
      console.log('[WhatsApp Store] Estado sincronizado:', status)

      // 🛡️ FIX DEFENSIVO: No confiar ciegamente en status.connected del backend
      // Solo considerar conectado si REALMENTE está conectado:
      // 1. state === 'connected' (estado real es conectado)
      // 2. user !== null (hay sesión activa de WhatsApp)
      const isReallyConnected = status.state === 'connected' && status.user !== null

      console.log('[WhatsApp Store] Validación defensiva:', {
        backendSaysConnected: status.connected,
        stateIsConnected: status.state === 'connected',
        hasUser: status.user !== null,
        isReallyConnected: isReallyConnected
      })

      commit('SET_CONNECTED', isReallyConnected)
      commit('SET_CONNECTION_INFO', status.user || status.connectionInfo)

      if (isReallyConnected) {
        commit('SET_CONNECTION_ERROR', null)
        commit('SET_QR_CODE', null)
      } else if (status.state === 'connecting') {
        // Si está conectando, limpiar error pero no marcar como conectado
        commit('SET_CONNECTION_ERROR', null)
      }

      return { ...status, connected: isReallyConnected }
    } catch (error) {
      console.error('[WhatsApp Store] Error verificando estado:', error)
      commit('SET_CONNECTED', false)
      commit('SET_CONNECTION_INFO', null)

      // Si es error de conexión, mostrar mensaje más amigable
      if (error.message?.includes('WhatsApp no está conectado')) {
        commit('SET_CONNECTION_ERROR', 'WhatsApp desconectado')
      } else {
        commit('SET_CONNECTION_ERROR', error.message)
      }

      return { connected: false }
    }
  },
  
  // Acción para forzar sincronización cuando detectamos desbalance
  async forceStatusSync({ commit, dispatch }) {
    console.log('[WhatsApp Store] 🔄 Forzando sincronización de estado...')
    try {
      // Intentar múltiples verificaciones
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`[WhatsApp Store] Intento de sincronización ${attempt}/3`)

        const status = await whatsappService.getStatus()
        console.log('[WhatsApp Store] Estado obtenido:', status)

        // 🛡️ FIX DEFENSIVO: Validar estado real
        const isReallyConnected = status.state === 'connected' && status.user !== null

        if (isReallyConnected) {
          console.log('[WhatsApp Store] ✅ Estado sincronizado - WhatsApp conectado!')
          commit('SET_CONNECTED', true)
          commit('SET_CONNECTION_INFO', status.user)
          commit('SET_CONNECTION_ERROR', null)
          return status
        }

        // Esperar 2 segundos entre intentos
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log('[WhatsApp Store] ❌ No se pudo sincronizar estado después de 3 intentos')
      return { connected: false }
    } catch (error) {
      console.error('[WhatsApp Store] Error en sincronización forzada:', error)
      return { connected: false }
    }
  },

  // Acción para detectar y corregir desconexiones automáticamente
  async detectAndReconnect({ commit, state, dispatch }) {
    console.log('[WhatsApp Store] 🔍 Detectando estado de conexión...')

    if (state.connecting) {
      console.log('[WhatsApp Store] Ya hay una conexión en proceso')
      return false
    }

    try {
      // Verificar estado actual
      const status = await whatsappService.getStatus()

      // 🛡️ FIX DEFENSIVO: Validar estado real
      const isReallyConnected = status.state === 'connected' && status.user !== null

      if (!isReallyConnected && state.connected) {
        console.log('[WhatsApp Store] ⚠️ Desconexión detectada - intentando reconexión...')
        commit('SET_CONNECTED', false)
        commit('SET_CONNECTION_INFO', null)

        // Intentar reconexión automática
        try {
          await dispatch('connect')
          console.log('[WhatsApp Store] ✅ Reconexión exitosa')
          return true
        } catch (error) {
          console.error('[WhatsApp Store] ❌ Falló reconexión automática:', error)
          commit('SET_CONNECTION_ERROR', 'Conexión perdida - reconexión falló')
          return false
        }
      } else if (isReallyConnected && !state.connected) {
        console.log('[WhatsApp Store] ✅ Conexión encontrada - sincronizando estado')
        commit('SET_CONNECTED', true)
        commit('SET_CONNECTION_INFO', status.user)
        commit('SET_CONNECTION_ERROR', null)
        return true
      }

      return isReallyConnected
    } catch (error) {
      console.error('[WhatsApp Store] Error en detección de conexión:', error)
      return false
    }
  },
  
  async fetchContacts({ commit, state }) {
    console.log('[WhatsApp Store] Obteniendo contactos')
    try {
      const contacts = await whatsappService.getContacts()
      commit('SET_CONTACTS', contacts)
      return contacts
    } catch (error) {
      console.error('[WhatsApp Store] Error obteniendo contactos:', error)
      
      // Si el error es de conexión inactiva, actualizar estado
      if (error.message?.includes('not active')) {
        console.log('[WhatsApp Store] Detectada conexión inactiva - actualizando estado')
        commit('SET_CONNECTED', false)
        commit('SET_CONNECTION_INFO', null)
      }
      
      // No mostrar toast error para no molestar al usuario
      console.warn('[WhatsApp Store] Contactos no disponibles - conexión WhatsApp requerida')
      commit('SET_CONTACTS', []) // Establecer array vacío
      return []
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
      
      // Si el error es de conexión inactiva, actualizar estado
      if (error.message?.includes('not active')) {
        console.log('[WhatsApp Store] Detectada conexión inactiva - actualizando estado')
        commit('SET_CONNECTED', false)
        commit('SET_CONNECTION_INFO', null)
      }
      
      // No mostrar toast error para no molestar al usuario
      console.warn('[WhatsApp Store] Grupos no disponibles - conexión WhatsApp requerida')
      commit('SET_GROUPS', []) // Establecer array vacío
      return []
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
  },
  
  async sendMessage({ commit }, { to, message, options = {} }) {
    console.log('[WhatsApp Store] Enviando mensaje individual')
    try {
      const result = await whatsappService.sendMessage(to, message, options)
      toast.success('Mensaje enviado')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error enviando mensaje:', error)
      toast.error('Error al enviar mensaje')
      throw error
    }
  },
  
  async sendBulkMessages({ commit }, { messages, options = {} }) {
    console.log('[WhatsApp Store] Enviando mensajes masivos')
    try {
      const result = await whatsappService.sendBulkMessages(messages, options)
      toast.success(`Iniciando envío de ${messages.length} mensajes`)
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error enviando mensajes masivos:', error)
      toast.error('Error al enviar mensajes masivos')
      throw error
    }
  },
  
  async createCampaign({ commit }, campaignData) {
    console.log('[WhatsApp Store] Creando campaña')
    try {
      const result = await whatsappService.createCampaign(campaignData)
      toast.success('Campaña creada exitosamente')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error creando campaña:', error)
      toast.error('Error al crear campaña')
      throw error
    }
  },
  
  async executeCampaign({ commit }, campaignId) {
    console.log('[WhatsApp Store] Ejecutando campaña')
    try {
      const result = await whatsappService.executeCampaign(campaignId)
      toast.success('Campaña iniciada')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error ejecutando campaña:', error)
      toast.error('Error al ejecutar campaña')
      throw error
    }
  },
  
  async pauseCampaign({ commit }, campaignId) {
    console.log('[WhatsApp Store] Pausando campaña')
    try {
      const result = await whatsappService.pauseCampaign(campaignId)
      toast.info('Campaña pausada')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error pausando campaña:', error)
      toast.error('Error al pausar campaña')
      throw error
    }
  },
  
  async resumeCampaign({ commit }, campaignId) {
    console.log('[WhatsApp Store] Reanudando campaña')
    try {
      const result = await whatsappService.resumeCampaign(campaignId)
      toast.success('Campaña reanudada')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error reanudando campaña:', error)
      toast.error('Error al reanudar campaña')
      throw error
    }
  },
  
  async cancelCampaign({ commit }, campaignId) {
    console.log('[WhatsApp Store] Cancelando campaña')
    try {
      const result = await whatsappService.cancelCampaign(campaignId)
      toast.warning('Campaña cancelada')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error cancelando campaña:', error)
      toast.error('Error al cancelar campaña')
      throw error
    }
  },

  async fetchTodayMessagesStats({ commit }) {
    console.log('[WhatsApp Store] Obteniendo estadísticas de mensajes del día')
    try {
      const response = await whatsappService.getTodayStats()
      commit('SET_TODAY_MESSAGES_COUNT', response.todayCount || 0)
      if (response.monthlyLimit) {
        commit('SET_MONTHLY_LIMIT', response.monthlyLimit)
      }
      return response
    } catch (error) {
      console.error('[WhatsApp Store] Error obteniendo estadísticas:', error)
      // No mostrar toast error para no molestar al usuario
      return { todayCount: 0 }
    }
  }
}

const getters = {
  isConnected: state => state.connected,
  isConnecting: state => state.connecting,
  qrCode: state => state.qrCode,
  contacts: state => state.contacts,
  groups: state => state.groups,
  connectionInfo: state => state.connectionInfo,
  connectionError: state => state.connectionError,
  campaignProgress: state => state.campaignProgress,
  todayMessagesCount: state => state.todayMessagesCount,
  monthlyLimit: state => state.monthlyLimit,
  messagesProgress: state => {
    const progress = state.monthlyLimit > 0 ? (state.todayMessagesCount / state.monthlyLimit) * 100 : 0
    return Math.min(progress, 100)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}