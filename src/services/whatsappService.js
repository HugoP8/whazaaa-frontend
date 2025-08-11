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

  // Conectar socket
  connectSocket(userId) {
    console.log(`[WhatsApp Service] Conectando socket para usuario: ${userId}`)
    
    if (this.socket && this.socket.connected && this.userId === userId) {
      console.log('[WhatsApp Service] Socket ya conectado para este usuario')
      return this.socket
    }

    // Desconectar socket anterior si existe
    if (this.socket) {
      this.disconnectSocket()
    }

    this.userId = userId

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    })

    // Eventos básicos del socket
    this.socket.on('connect', () => {
      console.log('[WhatsApp Service] Socket conectado exitosamente:', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WhatsApp Service] Socket desconectado:', reason)
      this.connected = false
      
      if (reason === 'io server disconnect') {
        // Reconectar si el servidor desconectó
        this.socket.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WhatsApp Service] Error conectando socket:', error)
      this.connected = false
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WhatsApp Service] Socket reconectado, intento:', attemptNumber)
      this.connected = true
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('[WhatsApp Service] Error reconectando socket:', error)
    })

    return this.socket
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
      console.error('[WhatsApp Service] Error conectando WhatsApp:', error)
      throw new Error(error.response?.data?.error || 'Error al conectar WhatsApp')
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
      console.error('[WhatsApp Service] Error obteniendo estado:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener estado')
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
      return response.data.data || []
    } catch (error) {
      console.error('[WhatsApp Service] Error obteniendo grupos:', error)
      throw new Error(error.response?.data?.error || 'Error al obtener grupos')
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
      console.error('[WhatsApp Service] Error enviando mensaje:', error)
      throw new Error(error.response?.data?.error || 'Error al enviar mensaje')
    }
  }

  // Enviar mensajes masivos
  async sendBulkMessages(messages) {
    try {
      console.log('[WhatsApp Service] Enviando mensajes masivos:', messages.length)
      const response = await api.post('/whatsapp/send-bulk', { messages })
      console.log('[WhatsApp Service] Mensajes masivos enviados:', response.data)
      return response.data
    } catch (error) {
      console.error('[WhatsApp Service] Error enviando mensajes masivos:', error)
      throw new Error(error.response?.data?.error || 'Error al enviar mensajes masivos')
    }
  }

  // Verificar si está conectado
  isSocketConnected() {
    return this.socket && this.connected
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