// src/services/socket.js
import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }
  
  connect(userId = null) {
    if (this.socket && this.connected) {
      return this.socket
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')

    console.log('[Socket] Conectando a:', SOCKET_URL)
    console.log('[Socket] Token presente:', !!token)
    console.log('[Socket] User ID:', userId)

    // Configuración con autenticación JWT
    const socketConfig = {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    }

    // Agregar autenticación JWT si hay token
    if (token) {
      try {
        // Intentar parsear el token si está en formato JSON
        let tokenValue = token
        try {
          const parsed = JSON.parse(token)
          tokenValue = typeof parsed === 'string' ? parsed : token
        } catch (e) {
          // Si no es JSON, usar tal cual
        }

        socketConfig.auth = {
          token: tokenValue
        }

        // Agregar userId en query si está disponible
        if (userId) {
          socketConfig.query = {
            userId: userId
          }
        }

        console.log('[Socket] Configuración con autenticación JWT')
      } catch (error) {
        console.error('[Socket] Error procesando token:', error)
      }
    } else {
      console.warn('[Socket] No hay token disponible - conexión sin autenticación')
    }

    this.socket = io(SOCKET_URL, socketConfig)

    this.socket.on('connect', () => {
      console.log('[Socket] Conectado exitosamente', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexión:', error)
      this.connected = false

      // Manejar errores de autenticación
      if (error.message && error.message.includes('Authentication')) {
        console.error('[Socket] Error de autenticación - Token inválido o expirado')
        // Emitir evento para que la app pueda reaccionar
        this.socket.emit('auth_error', { message: 'Token inválido o expirado' })
      }
    })

    return this.socket
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      console.log('[Socket] Desconectado manualmente')
    }
  }
  
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }
  
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
  
  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data)
    }
  }
}

const socketService = new SocketService()
export default socketService.connect()