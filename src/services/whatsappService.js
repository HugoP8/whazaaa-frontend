// src/services/whatsappService.js
import { io } from 'socket.io-client'
import api from './api'
import { SOCKET_URL } from '@/utils/constants'

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
      throw new Error(`Timeout - ${operation} tardó demasiado`)
    }
    
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada - Por favor inicia sesión nuevamente')
    }
    
    if (error.response?.status === 503) {
      throw new Error('Servicio temporalmente no disponible - Intenta más tarde')
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Error del servidor - Intenta más tarde')
    }
    
    throw new Error(error.response?.data?.error || `Error al ${operation}`)
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
      
      // 4. Valor por defecto para desarrollo
      console.warn('[WhatsApp Service] 🚨 No se encontró userId, usando 1 por defecto')
      return 1
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo userId:', error)
      return 1
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
    console.log(`[WhatsApp Service] Conectando socket para usuario: ${finalUserId}`)

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,    // Aumentar delay
      reconnectionAttempts: 3,    // Reducir intentos
      timeout: 15000,
      query: { userId: finalUserId }
    })

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
      
      // Unirse al room una sola vez
      this.socket.emit('join-user-room', userId)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WhatsApp Service] Socket desconectado:', reason)
      this.connected = false
      
      // NO auto-reconectar en desarrollo para evitar loops con nodemon
      if (reason === 'io server disconnect' && process.env.NODE_ENV === 'production') {
        setTimeout(() => this.socket?.connect(), 3000)
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WhatsApp Service] Error conectando:', error.message)
      this.connected = false
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

  // Conectar WhatsApp (llamada HTTP)
  async connect() {
    try {
      console.log('[WhatsApp Service] Iniciando conexión WhatsApp via API')
      const response = await api.post('/whatsapp/connect')
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
      console.log('[WhatsApp Service] Grupos obtenidos:', response.data.data?.length || 0)
      
      // 🔍 LOG COMPLETO DE LA RESPUESTA DEL BACKEND
      console.log('🔍 [WhatsApp Service] RESPONSE COMPLETA DEL BACKEND:')
      console.log('📊 response.data:', response.data)
      console.log('📊 response.data.data:', response.data.data)
      console.log('📊 response.status:', response.status)
      console.log('📊 response.headers:', response.headers)
      
      // 🔍 LOG DETALLADO DE CADA GRUPO
      if (response.data.data && response.data.data.length > 0) {
        console.log('🔍 [WhatsApp Service] ESTRUCTURA DE LOS PRIMEROS 3 GRUPOS:')
        response.data.data.slice(0, 3).forEach((group, index) => {
          console.log(`📋 GRUPO ${index + 1} COMPLETO:`, JSON.stringify(group, null, 2))
          console.log(`📋 GRUPO ${index + 1} KEYS:`, Object.keys(group))
          console.log(`📋 GRUPO ${index + 1} VALUES:`, Object.values(group))
          
          // Verificar diferentes formas de almacenar participantes
          console.log(`🧑‍🤝‍🧑 PARTICIPANTES EN TODAS LAS FORMAS POSIBLES:`)
          console.log(`- group.participants:`, group.participants)
          console.log(`- group.participants?.length:`, group.participants?.length)
          console.log(`- group.members:`, group.members)
          console.log(`- group.members?.length:`, group.members?.length)
          console.log(`- group.size:`, group.size)
          console.log(`- group.participantCount:`, group.participantCount)
          console.log(`- group.memberCount:`, group.memberCount)
          console.log(`- group.groupSize:`, group.groupSize)
          console.log(`- group.count:`, group.count)
          console.log(`- group.total:`, group.total)
          console.log(`-------------------`)
        })
      }
      
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

  // Enviar mensaje
  async sendMessage(to, message, options = {}) {
    try {
      console.log('[WhatsApp Service] Enviando mensaje a:', to)
      const response = await api.post('/whatsapp/send-message', {
        to,
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

  // Crear campaña de mensajes
  async createCampaign(campaignData) {
    try {
      console.log('[WhatsApp Service] Creando campaña:', campaignData.name)
      const formData = new FormData()
      
      Object.keys(campaignData).forEach(key => {
        if (key === 'recipients' || key === 'groupIds') {
          formData.append(key, JSON.stringify(campaignData[key]))
        } else if (key === 'media' && campaignData[key]) {
          formData.append('media', campaignData[key])
        } else {
          formData.append(key, campaignData[key])
        }
      })
      
      const response = await api.post('/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('[WhatsApp Service] Campaña creada:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error creando campaña:', error)
      throw new Error(error.response?.data?.error || 'Error al crear campaña')
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
}

// Crear instancia única
const whatsappService = new WhatsAppService()

export { whatsappService }