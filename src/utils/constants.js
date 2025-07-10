export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'WhatsApp Mass Sender'

export const CAMPAIGN_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
}

export const CAMPAIGN_STATUS_LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  FAILED: 'Fallida'
}

export const CAMPAIGN_STATUS_COLORS = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  FAILED: 'error'
}

export const MESSAGE_DELAY_OPTIONS = [
  { value: 3000, text: '3 segundos' },
  { value: 5000, text: '5 segundos' },
  { value: 10000, text: '10 segundos' },
  { value: 15000, text: '15 segundos' },
  { value: 20000, text: '20 segundos' },
  { value: 30000, text: '30 segundos' }
]

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024 // 10MB

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'video/mp4',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CAMPAIGNS: '/campaigns',
  NEW_CAMPAIGN: '/campaigns/new',
  CAMPAIGN_DETAIL: '/campaigns/:id',
  CONTACTS: '/contacts',
  SETTINGS: '/settings'
}