// src/services/whatsappService.js
import { io } from 'socket.io-client'
import api from './api'
import { SOCKET_URL } from '@/utils/constants'
import { mediaHandler } from '@/utils/mediaHandler'

class WhatsAppService {
  constructor() {
    this.socket = null
    this.connected = false
    this.userId = null
  }

  // Helper method para manejo mejorado de errores
  handleApiError(error, operation) {
    console.error(`[WhatsApp Service] Error ${operation}:`, error)

    if (error.code === 'ECONNABORTED') {
      throw new Error(`Timeout - ${operation} tardó demasiado. La operación puede continuar en segundo plano.`)
    }

    if (error.response?.status === 401) {
      throw new Error('Sesión expirada - Por favor inicia sesión nuevamente')
    }

    if (error.response?.status === 413) {
      throw new Error('Archivo demasiado grande - Reduce el tamaño del archivo')
    }

    if (error.response?.status === 415) {
      throw new Error('Tipo de archivo no soportado - Usa JPG, PNG, MP4 o PDF')
    }

    if (error.response?.status === 503) {
      throw new Error('Servicio temporalmente no disponible - Intenta más tarde')
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor - Intenta más tarde')
    }

    throw new Error(error.response?.data?.error || error.response?.data?.message || `Error al ${operation}`)
  }

  // 🔥 Método para obtener userId de múltiples fuentes
  getUserId() {
    // Intentar múltiples fuentes para obtener userId
    try {
      // 1. Desde this.userId si ya está establecido
      if (this.userId) return this.userId
      
      // 2. Desde localStorage user
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.id) return user.id
      
      // 3. Desde localStorage token decodificado (si usas JWT)
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          if (payload.id || payload.userId) return payload.id || payload.userId
        } catch (e) {
          console.warn('[WhatsApp Service] No se pudo decodificar token JWT')
        }
      }
      
      throw new Error('No se encontró ID de usuario. Por favor, inicia sesión nuevamente.')
    } catch (error) {
      if (error.message.includes('ID de usuario')) throw error
      console.error('[WhatsApp Service] Error obteniendo userId:', error)
      throw new Error('Error obteniendo ID de usuario. Por favor, inicia sesión nuevamente.')
    }
  }

  // Conectar socket con protección contra loops
  connectSocket(userId, eventHandlers = {}) {
    const finalUserId = userId || this.getUserId()

    // Prevenir reconexiones excesivas
    if (this.socket?.connected && this.userId === finalUserId) {
      console.log('[WhatsApp Service] Reutilizando socket existente')
      return this.socket
    }

    // Desconectar limpiamente antes de crear nuevo socket
    if (this.socket) {
      this.disconnectSocket()
    }

    this.userId = finalUserId

    let token = localStorage.getItem('token')
    if (token) {
      try {
        const parsed = JSON.parse(token)
        token = typeof parsed === 'string' ? parsed : token
      } catch (e) {}
    }

    const socketConfig = {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      // Reconexión indefinida con backoff: si se corta el socket (wifi, laptop en sleep, etc.)
      // no debe dejar de intentar tras solo 3 intentos, porque es el canal por el que llega
      // el evento de logout remoto de WhatsApp (connection-status / requiresReauth).
      reconnectionAttempts: Infinity,
      timeout: 15000,
      query: { userId: finalUserId }
    }

    if (token) {
      socketConfig.auth = { token }
    } else {
      console.error('[WhatsApp Service] Sin token — el socket no podrá autenticarse')
    }

    this.socket = io(SOCKET_URL, socketConfig)

    // Configurar eventos básicos una sola vez
    this.setupBasicSocketEvents(finalUserId)
    this.setupWhatsAppEvents(finalUserId, eventHandlers)

    return this.socket
  }

  // Separar eventos básicos para evitar duplicación
  setupBasicSocketEvents(userId) {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('[WhatsApp Service] Socket conectado:', this.socket.id)
      this.connected = true

      // Unirse al room del usuario
      console.log(`[WhatsApp Service] Uniéndose a sala del usuario: user-${userId}`)
      this.socket.emit('join-user-room', userId)

      // Verificar que el join fue exitoso (redundancia para asegurar conexión)
      this.socket.emit('join', `user-${userId}`)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WhatsApp Service] Socket desconectado:', reason)
      this.connected = false

      // NO auto-reconectar en desarrollo para evitar loops con nodemon
      if (reason === 'io server disconnect' && process.env.NODE_ENV === 'production') {
        setTimeout(() => this.socket?.connect(), 3000)
      }
    })

    // Manejar reconexión exitosa
    this.socket.on('reconnect', () => {
      console.log('[WhatsApp Service] Socket reconectado exitosamente')
      this.connected = true

      // Re-unirse al room del usuario tras reconexión
      console.log(`[WhatsApp Service] Re-uniéndose a sala del usuario tras reconexión: user-${userId}`)
      this.socket.emit('join-user-room', userId)
      this.socket.emit('join', `user-${userId}`)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WhatsApp Service] Error conectando:', error.message)
      this.connected = false

      // Manejar errores de autenticación específicamente
      if (error.message && error.message.includes('Authentication')) {
        console.error('[WhatsApp Service] ❌ Error de autenticación JWT')
        console.error('[WhatsApp Service] Token inválido o expirado')

        // Limpiar token y redirigir al login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('membership')

        // Puedes emitir un evento o usar el router aquí si es necesario
        window.location.href = '/auth/login'
      }
    })
  }

  // Configurar eventos específicos de WhatsApp (simplificado)
  setupWhatsAppEvents(userId, handlers) {
    if (!this.socket) return

    console.log('[WhatsApp Service] Configurando eventos WhatsApp para usuario:', userId)

    // Solo eventos esenciales para evitar loops
    this.socket.on('qr', (data) => {
      console.log('[WhatsApp Service] QR Code recibido:', data)
      if (handlers.onQR) handlers.onQR(data)
    })

    this.socket.on('whatsapp-ready', (status) => {
      console.log('[WhatsApp Service] WhatsApp conectado:', status)
      if (handlers.onConnectionStatus) {
        handlers.onConnectionStatus({ connected: true, ...status })
      }
    })

    this.socket.on('whatsapp-disconnected', (status) => {
      console.log('[WhatsApp Service] WhatsApp desconectado:', status)
      if (handlers.onConnectionStatus) {
        handlers.onConnectionStatus({ connected: false, ...status })
      }
    })

    this.socket.on('campaign-progress', (data) => {
      console.log('[WhatsApp Service] Progreso de campaña:', data)
      if (handlers.onCampaignProgress) handlers.onCampaignProgress(data)
    })

    this.socket.on('connection-status', (status) => {
      console.log('[WhatsApp Service] Estado de conexión:', status)
      if (handlers.onConnectionStatus) {
        handlers.onConnectionStatus(status)
      }
    })

    this.socket.on('campaign-completed', (data) => {
      console.log('[WhatsApp Service] Campaña completada:', data)
      if (handlers.onCampaignCompleted) handlers.onCampaignCompleted(data)
    })

    this.socket.on('campaign-error', (data) => {
      console.log('[WhatsApp Service] Error en campaña:', data)
      if (handlers.onCampaignError) handlers.onCampaignError(data)
    })

    this.socket.on('whatsapp-error', (error) => {
      console.error('[WhatsApp Service] Error WhatsApp:', error)
      if (handlers.onError) handlers.onError(error)
    })
  }

  // Desconectar socket
  disconnectSocket() {
    if (this.socket) {
      console.log('[WhatsApp Service] Desconectando socket')
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.userId = null
    }
  }

  // Conectar WhatsApp (llamada HTTP). force=true rompe un intento atascado y fuerza QR nuevo.
  async connect(force = false) {
    try {
      console.log('[WhatsApp Service] Iniciando conexión WhatsApp via API', { force })
      const response = await api.post('/whatsapp/connect', { force })
      console.log('[WhatsApp Service] Respuesta de conexión:', response.data)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'conectar WhatsApp')
    }
  }

  // Desconectar WhatsApp
  async disconnect() {
    try {
      console.log('[WhatsApp Service] Desconectando WhatsApp via API')
      const response = await api.post('/whatsapp/logout')
      console.log('[WhatsApp Service] WhatsApp desconectado:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error desconectando WhatsApp:', error)
      throw new Error(error.response?.data?.error || 'Error al desconectar WhatsApp')
    }
  }

  // Obtener estado de conexión
  async getStatus() {
    try {
      console.log('[WhatsApp Service] Obteniendo estado WhatsApp')
      const response = await api.get('/whatsapp/status')
      console.log('[WhatsApp Service] Estado obtenido:', response.data)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'obtener estado')
    }
  }

  // Obtener contactos
  async getContacts() {
    try {
      console.log('[WhatsApp Service] Obteniendo contactos')
      const response = await api.get('/whatsapp/contacts')
      console.log('[WhatsApp Service] Contactos obtenidos:', response.data.data?.length || 0)
      return response.data.data || []
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo contactos:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener contactos')
    }
  }

  // Obtener grupos
  async getGroups() {
    try {
      console.log('[WhatsApp Service] Obteniendo grupos')
      const response = await api.get('/whatsapp/groups')
      return response.data.data || []
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo grupos:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener grupos')
    }
  }

  // Obtener participantes de un grupo específico (carga lazy)
  async getGroupParticipants(groupId) {
    try {
      console.log('[WhatsApp Service] Cargando participantes del grupo:', groupId)
      const response = await api.get(`/whatsapp/groups/${groupId}/participants`)
      console.log('[WhatsApp Service] Participantes obtenidos:', response.data.data?.length || 0)
      
      return response.data.data?.participantJids || response.data.data || []
    } catch (error) {
      console.error('[WhatsApp Service] Error cargando participantes:', error)
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - La carga de participantes tardó demasiado')
      }
      
      throw new Error(error.response?.data?.error || 'Error al cargar participantes del grupo')
    }
  }

  // Sincronizar contactos
  async syncContacts() {
    try {
      console.log('[WhatsApp Service] Sincronizando contactos')
      const response = await api.post('/whatsapp/contacts/sync')
      console.log('[WhatsApp Service] Contactos sincronizados:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error sincronizando contactos:', error)
      throw new Error(error.response?.data?.error || 'Error al sincronizar contactos')
    }
  }

  // Enviar mensaje individual
  // NOTA: La ruta correcta es /campaigns/send-message, no /whatsapp/send-message
  async sendMessage(to, message, options = {}) {
    try {
      console.log('[WhatsApp Service] Enviando mensaje a:', to)
      const response = await api.post('/campaigns/send-message', {
        recipient: to,
        message,
        ...options
      })
      console.log('[WhatsApp Service] Mensaje enviado:', response.data)
      return response.data
    } catch (error) {
      this.handleApiError(error, 'enviar mensaje')
    }
  }

  // Enviar mensajes masivos
  async sendBulkMessages(messages, options = {}) {
    try {
      console.log('[WhatsApp Service] Enviando mensajes masivos:', messages.length)
      const response = await api.post('/whatsapp/send-bulk', { 
        messages,
        options: {
          delay: options.delay || 1000,
          batchSize: options.batchSize || 10,
          ...options
        }
      })
      console.log('[WhatsApp Service] Mensajes masivos iniciados:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error enviando mensajes masivos:', error)
      throw new Error(error.response?.data?.error || 'Error al enviar mensajes masivos')
    }
  }

  // Crear campaña de mensajes con manejo moderno de archivos
  async createCampaign(campaignData) {
    try {
      console.log('[WhatsApp Service] Creando campaña con datos:',
        campaignData instanceof FormData ? 'FormData' : typeof campaignData)

      let formData

      // Si ya es FormData (viene del MediaHandler), usar directamente
      if (campaignData instanceof FormData) {
        formData = campaignData
        console.log('[WhatsApp Service] Usando FormData existente del MediaHandler')
      } else {
        // Convertir objeto a FormData usando MediaHandler
        console.log('[WhatsApp Service] Convirtiendo objeto a FormData:', Object.keys(campaignData))

        // Extraer archivos del objeto si existen
        let files = null
        const cleanData = { ...campaignData }

        if (campaignData.media) {
          if (campaignData.media instanceof File) {
            files = [campaignData.media]
          } else if (campaignData.media instanceof FileList) {
            files = Array.from(campaignData.media)
          }
          // Remover media del objeto para evitar duplicación
          delete cleanData.media
        }

        // Crear FormData usando MediaHandler
        formData = mediaHandler.createFormData(cleanData, files, {
          fileFieldName: 'media'
        })
      }

      // Enviar solicitud con configuración optimizada para archivos
      const response = await api.post('/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000, // 2 minutos para campañas con archivos grandes
        maxContentLength: 50 * 1024 * 1024, // 50MB máximo
        maxBodyLength: 50 * 1024 * 1024,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`[WhatsApp Service] Progreso de subida: ${percentCompleted}%`)
          }
        }
      })

      console.log('[WhatsApp Service] Campaña creada exitosamente:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error creando campaña:', error)

      // Manejo específico de errores de archivos
      if (error.code === 'ECONNABORTED') {
        throw new Error('La subida del archivo tardó demasiado. Verifica tu conexión y el tamaño del archivo.')
      }

      this.handleApiError(error, 'crear campaña')
    }
  }

  // Ejecutar campaña
  async executeCampaign(campaignId) {
    try {
      console.log('[WhatsApp Service] Ejecutando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/execute`)
      console.log('[WhatsApp Service] Campaña ejecutada:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error ejecutando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al ejecutar campaña')
    }
  }

  // Reprogramar una campaña SCHEDULED (sendAt debe ser un ISO string en UTC)
  async rescheduleCampaign(campaignId, sendAt) {
    try {
      const response = await api.put(`/campaigns/${campaignId}/reschedule`, { sendAt })
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error reprogramando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al reprogramar campaña')
    }
  }

  // Pausar campaña
  async pauseCampaign(campaignId) {
    try {
      console.log('[WhatsApp Service] Pausando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/pause`)
      console.log('[WhatsApp Service] Campaña pausada:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error pausando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al pausar campaña')
    }
  }

  // Reanudar campaña
  async resumeCampaign(campaignId) {
    try {
      console.log('[WhatsApp Service] Reanudando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/resume`)
      console.log('[WhatsApp Service] Campaña reanudada:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error reanudando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al reanudar campaña')
    }
  }

  // Cancelar campaña
  async cancelCampaign(campaignId) {
    try {
      console.log('[WhatsApp Service] Cancelando campaña:', campaignId)
      const response = await api.post(`/campaigns/${campaignId}/cancel`)
      console.log('[WhatsApp Service] Campaña cancelada:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error cancelando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al cancelar campaña')
    }
  }

  // Verificar si está conectado
  isSocketConnected() {
    return this.socket && this.connected
  }

  // Sincronizar estado con el backend (fix para conexión desínconizada)
  async syncConnectionStatus() {
    try {
      console.log('[WhatsApp Service] Sincronizando estado con backend...')
      const status = await this.getStatus()
      console.log('[WhatsApp Service] Estado real del backend:', status)
      
      // Si hay discrepancia entre socket y API, reconectar socket
      if (status.connected && !this.connected) {
        console.log('[WhatsApp Service] Backend conectado pero socket desconectado - reconectando...')
        return status
      } else if (!status.connected && this.connected) {
        console.log('[WhatsApp Service] Socket conectado pero backend desconectado - desconectando socket...')
        this.connected = false
      }
      
      return status
    } catch (error) {
      console.error('[WhatsApp Service] Error sincronizando estado:', error)
      throw error
    }
  }

  // Obtener información del socket
  getSocketInfo() {
    return {
      connected: this.connected,
      socketId: this.socket?.id,
      userId: this.userId
    }
  }

  // ============================================================
  // GESTIÓN DE CUENTAS (múltiples números por usuario)
  // ============================================================

  async getAccounts() {
    try {
      const response = await api.get('/whatsapp/accounts')
      return response.data.data || []
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo cuentas:', error)
      return []
    }
  }

  async checkCanAddAccount() {
    try {
      const response = await api.get('/whatsapp/accounts/can-add')
      return response.data
    } catch (error) {
      return { canAdd: false, current: 0, maxAllowed: 1 }
    }
  }

  async createAccount(accountName = 'Mi WhatsApp') {
    try {
      const response = await api.post('/whatsapp/accounts', { accountName })
      return response.data.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear la cuenta')
    }
  }

  async connectAccount(accountId) {
    try {
      const response = await api.post(`/whatsapp/accounts/${accountId}/connect`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al conectar la cuenta')
    }
  }

  async logoutAccount(accountId) {
    try {
      const response = await api.post(`/whatsapp/accounts/${accountId}/logout`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al desconectar la cuenta')
    }
  }

  async deleteAccount(accountId) {
    try {
      const response = await api.delete(`/whatsapp/accounts/${accountId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar la cuenta')
    }
  }

  // Obtener número de teléfono vinculado a la cuenta
  async getPhoneNumber() {
    try {
      const response = await api.get('/whatsapp/phone-number')
      return response.data
    } catch (error) {
      return null
    }
  }

  // Desvincular número (borra sesión + limpia BD → siguiente connect genera nuevo QR)
  async clearPhoneBinding() {
    try {
      const response = await api.post('/whatsapp/phone-number/clear')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al desvincular número')
    }
  }

  // Obtener diagnóstico del sistema
  async getDiagnostic() {
    try {
      console.log('[WhatsApp Service] Obteniendo diagnóstico del sistema')
      const response = await api.get('/whatsapp/diagnostic')
      console.log('[WhatsApp Service] Diagnóstico obtenido:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo diagnóstico:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener diagnóstico')
    }
  }

  // Obtener estadísticas de campañas
  async getCampaignStats() {
    try {
      console.log('[WhatsApp Service] Obteniendo estadísticas de campañas')
      const response = await api.get('/campaigns/stats')
      console.log('[WhatsApp Service] Estadísticas obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo estadísticas:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener estadísticas')
    }
  }

  async getTodayStats() {
    try {
      console.log('[WhatsApp Service] Obteniendo estadísticas de mensajes del día')
      const response = await api.get('/whatsapp/stats/today')
      console.log('[WhatsApp Service] Estadísticas del día obtenidas:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo estadísticas del día:', error)
      // No lanzar error para no romper la UI
      return { todayCount: 0, monthlyLimit: 300 }
    }
  }

  // Obtener datos para reutilizar campaña
  async getCampaignReuseData(campaignId) {
    try {
      console.log('[WhatsApp Service] Obteniendo datos de reutilización para campaña:', campaignId)
      const response = await api.get(`/campaigns/${campaignId}/reuse-data`)
      console.log('[WhatsApp Service] Datos de reutilización obtenidos:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo datos de reutilización:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener datos de reutilización')
    }
  }
}

// Crear instancia única
const whatsappService = new WhatsAppService()

export { whatsappService }