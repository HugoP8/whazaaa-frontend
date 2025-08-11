// src/services/socket.js
import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }
  
  connect() {
    if (this.socket && this.connected) {
      return this.socket
    }
    
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
    
    console.log('[Socket] Conectando a:', SOCKET_URL)
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    })
    
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