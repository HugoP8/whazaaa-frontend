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

// Watchdog de seguridad para el estado "conectando": si pasa este tiempo sin
// ningún evento del backend (socket caído, evento perdido, etc.), dejamos de
// esperar y mostramos el mismo mensaje de reconexión manual que emitiría el
// backend. Antes eran 15min — demasiado tiempo mirando un spinner sin
// feedback; el usuario tiene además un botón de "Forzar QR" disponible desde
// el inicio para no tener que esperar nada de esto.
const CONNECTING_WATCHDOG_MS = 45 * 1000
const GIVE_UP_ERROR_MSG = 'Se cerró la conexión con WhatsApp Web. Esto es normal — vuelve a conectar y escanea el código QR.'
let _connectingWatchdogTimer = null
function _armConnectingWatchdog(commit) {
  _clearConnectingWatchdog()
  _connectingWatchdogTimer = setTimeout(() => {
    console.warn('[WhatsApp Store] Watchdog: sin novedades tras 15min conectando — ofreciendo reconexión manual')
    commit('SET_CONNECTING', false)
    commit('SET_CONNECTION_ERROR', GIVE_UP_ERROR_MSG)
  }, CONNECTING_WATCHDOG_MS)
}
function _clearConnectingWatchdog() {
  if (_connectingWatchdogTimer) { clearTimeout(_connectingWatchdogTimer); _connectingWatchdogTimer = null }
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
  cleanupSocket: null,
  campaignProgress: null,
  todayMessagesCount: 0,
  monthlyLimit: 300,
  boundPhoneNumber: null,    // Número vinculado a la cuenta
  phoneConflict: null,
  phoneMismatch: null,       // { boundPhone, attemptedPhone } — número incorrecto escaneado
  accounts: [],
  activeAccountId: null,
  canAddAccount: false,
  maxAccounts: 1
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
  },

  SET_BOUND_PHONE(state, phone) {
    state.boundPhoneNumber = phone
  },

  SET_PHONE_CONFLICT(state, conflict) {
    state.phoneConflict = conflict
  },

  SET_PHONE_MISMATCH(state, mismatch) {
    state.phoneMismatch = mismatch
    if (mismatch) {
      // Si hay mismatch, la conexión fue rechazada → limpiar estado de conectando
      state.connected = false
      state.connecting = false
      state.qrCode = null
    }
  },

  CLEAR_PHONE_MISMATCH(state) {
    state.phoneMismatch = null
  },

  CLEAR_CONNECTION_ERROR(state) {
    state.connectionError = null
  },

  SET_ACCOUNTS(state, accounts) {
    state.accounts = accounts
  },

  SET_ACTIVE_ACCOUNT_ID(state, accountId) {
    state.activeAccountId = accountId
  },

  SET_CAN_ADD_ACCOUNT(state, { canAdd, current, maxAllowed }) {
    state.canAddAccount = canAdd
    state.maxAccounts = maxAllowed
  },

  UPDATE_ACCOUNT_STATUS(state, { accountId, status, connected, phoneNumber }) {
    const acc = state.accounts.find(a => String(a.id) === String(accountId))
    if (acc) {
      acc.status = status
      acc.is_connected = connected
      if (phoneNumber) acc.phone_number = phoneNumber
    }
  }
}

const actions = {
  async connect({ commit, dispatch, rootState, state }, { force = false } = {}) {
    console.log('[WhatsApp Store] Ejecutando acción connect', { force })

    if (state.connecting && !force) {
      console.log('[WhatsApp Store] Ya se está conectando, ignorando nueva solicitud')
      return
    }

    commit('SET_CONNECTING', true)
    commit('SET_CONNECTION_ERROR', null)
    commit('SET_QR_CODE', null)
    _armConnectingWatchdog(commit)

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

          if (status.phoneMismatch) {
            // BLOQUEO DURO: número incorrecto escaneado
            console.error('[WhatsApp Store] 🚫 Número incorrecto — cuenta bloqueada')
            commit('SET_PHONE_MISMATCH', {
              boundPhone: status.boundPhone,
              attemptedPhone: status.attemptedPhone,
              message: status.error
            })
            commit('SET_CONNECTED', false)
            commit('SET_CONNECTING', false)
            commit('SET_QR_CODE', null)
            _notifyError(`Número incorrecto. La cuenta está vinculada a +${status.boundPhone}`)
            return
          }

          if (status.connected) {
            _clearConnectingWatchdog()
            commit('SET_CONNECTED', true)
            commit('SET_CONNECTING', false)
            commit('SET_QR_CODE', null)
            commit('SET_CONNECTION_INFO', status.user || status)
            commit('SET_CONNECTION_ERROR', null)
            commit('CLEAR_PHONE_MISMATCH')
            if (status.phoneNumber) commit('SET_BOUND_PHONE', status.phoneNumber)
            _notifyConnected()
          } else if (status.giveUp) {
            // El backend agotó sus reintentos automáticos (flapping persistente)
            // y ya cerró la sesión por completo (borró las credenciales). A
            // diferencia de requiresReauth "normal", aquí NO reintentamos solos
            // ni generamos QR automáticamente — se le avisa al usuario y queda
            // esperando que haga clic en "Reintentar" para volver a conectar
            // (eso mostrará un QR nuevo, ya que la sesión anterior se borró).
            console.warn('[WhatsApp Store] Conexión cerrada tras agotar reintentos — esperando reconexión manual')
            _clearConnectingWatchdog()
            commit('SET_CONNECTED', false)
            commit('SET_CONNECTING', false)
            commit('SET_QR_CODE', null)
            commit('SET_CONNECTION_INFO', null)
            commit('SET_CONNECTION_ERROR', status.error || GIVE_UP_ERROR_MSG)
            toast.warning(status.error || GIVE_UP_ERROR_MSG, { timeout: 6000 })
          } else if (status.requiresReauth) {
            console.warn('[WhatsApp Store] Sesión destruida - se requiere nuevo QR')
            _clearConnectingWatchdog()
            commit('SET_CONNECTED', false)
            commit('SET_QR_CODE', null)
            commit('SET_CONNECTING', false)
            commit('SET_CONNECTION_INFO', null)
            _notifyReauth()
            setTimeout(() => {
              if (!state.connecting) dispatch('connect')
            }, 2000)
          } else if (status.reconnecting || status.status === 'connecting') {
            console.log('[WhatsApp Store] Reconectando automáticamente...')
            commit('SET_CONNECTED', false)
            commit('SET_CONNECTING', true)
            _armConnectingWatchdog(commit)
          } else if (status.qr) {
            commit('SET_QR_CODE', status.qr)
          } else {
            console.warn('[WhatsApp Store] Desconectado')
            _clearConnectingWatchdog()
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
          commit('CAMPAIGN_PROGRESS', data)
          dispatch('campaigns/onCampaignProgress', data, { root: true })
        },

        onCampaignCompleted: (data) => {
          dispatch('campaigns/onCampaignCompleted', data, { root: true })
        },

        onCampaignError: (data) => {
          console.error('[WhatsApp Store] Error en campaña:', data)
        }
      }

      const setupPhoneEvents = (socket) => {
        // whatsappService.connectSocket() reutiliza el mismo socket cacheado en
        // llamadas repetidas a connect() (reconexiones, reintento tras
        // requiresReauth) — sin esta guarda, cada llamada apila listeners
        // nuevos sobre el mismo socket y los eventos llegan duplicados.
        if (socket._phoneEventsRegistered) return
        socket._phoneEventsRegistered = true

        socket.on('phone-number-changed', (data) => {
          commit('SET_BOUND_PHONE', data.newPhone)
          commit('UPDATE_ACCOUNT_STATUS', { accountId: data.accountId, phoneNumber: data.newPhone })
          toast.info(`Cuenta vinculada al número +${data.newPhone}`, { timeout: 5000 })
        })
        socket.on('phone-conflict', (data) => {
          commit('SET_PHONE_CONFLICT', data)
          toast.warning(data.message, { timeout: 8000 })
        })
        socket.on('account-status', (data) => {
          commit('UPDATE_ACCOUNT_STATUS', {
            accountId: data.accountId,
            status: data.state,
            connected: data.connected,
            phoneNumber: data.phoneNumber
          })
        })
      }
      
      // Conectar socket con manejadores
      const socket = whatsappService.connectSocket(userId, eventHandlers)
      commit('SET_SOCKET', socket)
      setupPhoneEvents(socket)
      
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
      const connectResponse = await whatsappService.connect(force)
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
      _clearConnectingWatchdog()
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
  
  // El usuario no quiere/puede esperar a que el backend se recupere solo:
  // rompe cualquier intento atascado y fuerza un QR nuevo de inmediato.
  async forceReconnect({ commit, dispatch }) {
    console.log('[WhatsApp Store] 🔴 Forzando reconexión y nuevo QR...')
    _clearConnectingWatchdog()
    commit('SET_CONNECTION_ERROR', null)
    commit('SET_QR_CODE', null)
    commit('SET_CONNECTED', false)
    commit('SET_CONNECTING', true)
    _armConnectingWatchdog(commit)
    try {
      await dispatch('connect', { force: true })
    } catch (error) {
      console.error('[WhatsApp Store] Error forzando reconexión:', error)
      commit('SET_CONNECTING', false)
      commit('SET_CONNECTION_ERROR', error.message || 'No se pudo forzar la reconexión')
    }
  },

  async disconnect({ commit, state }) {
    console.log('[WhatsApp Store] Ejecutando acción disconnect')
    _lastConnectedState = null
    _clearConnectingWatchdog()

    // 1. Llamar al logout HTTP para desconectar WhatsApp del servidor
    try {
      await whatsappService.disconnect()
      console.log('[WhatsApp Store] WhatsApp desconectado del servidor')
    } catch (error) {
      // No bloquear — continuar limpiando el estado local
      console.warn('[WhatsApp Store] Error al llamar logout HTTP (continuando limpieza):', error.message)
    }

    // 2. Limpiar estado del store
    commit('SET_CONNECTED', false)
    commit('SET_CONNECTING', false)
    commit('SET_QR_CODE', null)
    commit('SET_CONNECTION_INFO', null)
    commit('SET_CONNECTION_ERROR', null)

    // 3. Ejecutar limpieza si existe
    if (state.cleanupSocket) {
      state.cleanupSocket()
      commit('SET_CLEANUP', null)
    }

    // 4. Desconectar socket
    if (state.socket) {
      try {
        state.socket.removeAllListeners()
        state.socket.disconnect()
      } catch (e) {
        console.warn('[WhatsApp Store] Error desconectando socket:', e.message)
      }
      commit('SET_SOCKET', null)
    }
  },
  
  async checkStatus({ commit, state, dispatch }) {
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

      // El store creía que estaba conectado y el backend ya no lo está: esto detecta
      // un logout remoto (desde el teléfono) cuyo evento de socket no llegó a tiempo
      // (socket caído, laptop en sleep, etc.) — el poll periódico es el respaldo.
      const wasConnected = state.connected
      const missedRemoteLogout = wasConnected && !isReallyConnected && status.state !== 'connecting'

      commit('SET_CONNECTED', isReallyConnected)
      commit('SET_CONNECTION_INFO', status.user || status.connectionInfo)

      if (isReallyConnected) {
        commit('SET_CONNECTION_ERROR', null)
        commit('SET_QR_CODE', null)
      } else if (status.state === 'connecting') {
        // Si está conectando, limpiar error pero no marcar como conectado
        commit('SET_CONNECTION_ERROR', null)
      } else if (missedRemoteLogout) {
        commit('SET_QR_CODE', null)
        _notifyReauth()
        setTimeout(() => {
          if (!state.connecting) dispatch('connect')
        }, 2000)
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
      // El toast de éxito lo muestra el componente: el mensaje difiere si la
      // campaña se programó para el futuro o se está enviando ya.
      const result = await whatsappService.createCampaign(campaignData)
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
  
  async rescheduleCampaign({ commit }, { campaignId, sendAt }) {
    try {
      const result = await whatsappService.rescheduleCampaign(campaignId, sendAt)
      toast.success('Campaña reprogramada')
      return result
    } catch (error) {
      console.error('[WhatsApp Store] Error reprogramando campaña:', error)
      toast.error(error.message || 'Error al reprogramar campaña')
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

  async fetchBoundPhoneNumber({ commit }) {
    try {
      const result = await whatsappService.getPhoneNumber()
      const phone = typeof result === 'string' ? result : result?.phoneNumber || null
      commit('SET_BOUND_PHONE', phone)
      return phone
    } catch (error) {
      return null
    }
  },

  async clearPhoneBinding({ commit, dispatch }) {
    try {
      await whatsappService.clearPhoneBinding()
      commit('SET_BOUND_PHONE', null)
      commit('CLEAR_PHONE_MISMATCH')
      commit('SET_CONNECTED', false)
      commit('SET_QR_CODE', null)
      commit('SET_CONNECTING', false)
      toast.success('Número desvinculado. Escanea el QR para vincular uno nuevo.')
    } catch (error) {
      toast.error('Error al desvincular: ' + (error.message || 'intenta de nuevo'))
      throw error
    }
  },

  async fetchAccounts({ commit }) {
    try {
      const accounts = await whatsappService.getAccounts()
      commit('SET_ACCOUNTS', accounts)
      // Marcar la cuenta activa (default o la primera conectada)
      const activeAcc = accounts.find(a => a.is_connected) || accounts.find(a => a.is_default) || accounts[0]
      if (activeAcc) {
        commit('SET_ACTIVE_ACCOUNT_ID', activeAcc.id)
        if (activeAcc.phone_number) commit('SET_BOUND_PHONE', activeAcc.phone_number)
      }
      return accounts
    } catch (error) {
      console.error('[WhatsApp Store] Error cargando cuentas:', error)
      return []
    }
  },

  async checkCanAddAccount({ commit }) {
    try {
      const result = await whatsappService.checkCanAddAccount()
      commit('SET_CAN_ADD_ACCOUNT', result)
      return result
    } catch (error) {
      return { canAdd: false, current: 0, maxAllowed: 1 }
    }
  },

  async addAccount({ commit, dispatch }, accountName) {
    try {
      const account = await whatsappService.createAccount(accountName)
      await dispatch('fetchAccounts')
      toast.success(`Cuenta "${accountName}" creada exitosamente`)
      return account
    } catch (error) {
      toast.error(error.message || 'Error al crear la cuenta')
      throw error
    }
  },

  async connectAccount({ commit, dispatch }, accountId) {
    try {
      await whatsappService.connectAccount(accountId)
      commit('SET_ACTIVE_ACCOUNT_ID', accountId)
      // El socket recibirá los eventos de QR/connection-status
    } catch (error) {
      toast.error('Error al conectar la cuenta')
      throw error
    }
  },

  async removeAccount({ commit, dispatch }, accountId) {
    try {
      await whatsappService.deleteAccount(accountId)
      await dispatch('fetchAccounts')
      toast.success('Cuenta eliminada')
    } catch (error) {
      toast.error(error.message || 'Error al eliminar la cuenta')
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
  socket: state => state.socket,
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
  boundPhoneNumber: state => state.boundPhoneNumber,
  phoneConflict: state => state.phoneConflict,
  phoneMismatch: state => state.phoneMismatch,
  accounts: state => state.accounts,
  activeAccountId: state => state.activeAccountId,
  canAddAccount: state => state.canAddAccount,
  maxAccounts: state => state.maxAccounts,
  connectedAccounts: state => state.accounts.filter(a => a.is_connected),
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