import api from './api'
import io from 'socket.io-client'
import { SOCKET_URL } from '@/utils/constants'

let socket = null

export const whatsappService = {
  async connect() {
    const response = await api.post('/whatsapp/connect')
    return response.data
  },

  async disconnect() {
    const response = await api.post('/whatsapp/logout')
    return response.data
  },

  async getStatus() {
    const response = await api.get('/whatsapp/status')
    return response.data
  },

  async getGroups() {
    const response = await api.get('/whatsapp/groups')
    return response.data
  },

  async getContacts() {
    const response = await api.get('/whatsapp/contacts')
    return response.data
  },

  async syncContacts() {
    const response = await api.post('/whatsapp/contacts/sync')
    return response.data
  },

  // Socket.io connection
  connectSocket(userId) {
    if (socket) {
      socket.disconnect()
    }

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId }
    })

    return socket
  },

  getSocket() {
    return socket
  },

  disconnectSocket() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }
}