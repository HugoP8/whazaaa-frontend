// src/utils/constants.js

// URLs de la aplicación
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'WhatsApp Mass Sender'

// Estados de campaña
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// Colores para estados de campaña
export const CAMPAIGN_STATUS_COLORS = {
  [CAMPAIGN_STATUS.DRAFT]: 'grey',
  [CAMPAIGN_STATUS.SCHEDULED]: 'blue',
  [CAMPAIGN_STATUS.RUNNING]: 'orange',
  [CAMPAIGN_STATUS.COMPLETED]: 'green',
  [CAMPAIGN_STATUS.PAUSED]: 'yellow',
  [CAMPAIGN_STATUS.FAILED]: 'red',
  [CAMPAIGN_STATUS.CANCELLED]: 'grey-darken-2'
}

// Etiquetas para estados de campaña
export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUS.DRAFT]: 'Borrador',
  [CAMPAIGN_STATUS.SCHEDULED]: 'Programada',
  [CAMPAIGN_STATUS.RUNNING]: 'En Progreso',
  [CAMPAIGN_STATUS.COMPLETED]: 'Completada',
  [CAMPAIGN_STATUS.PAUSED]: 'Pausada',
  [CAMPAIGN_STATUS.FAILED]: 'Fallida',
  [CAMPAIGN_STATUS.CANCELLED]: 'Cancelada'
}

// Estados de WhatsApp
export const WHATSAPP_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error'
}

// Tipos de mensaje
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  VIDEO: 'video'
}

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
  DEFAULT_PAGE: 1
}

// Límites de mensajes
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 4000,
  MAX_RECIPIENTS: 1000,
  DELAY_BETWEEN_MESSAGES: 1000 // 1 segundo
}

// Configuración de socket
export const SOCKET_EVENTS = {
  QR_CODE: 'qr-code',
  CONNECTION_STATUS: 'connection-status',
  MESSAGE_SENT: 'message-sent',
  MESSAGE_FAILED: 'message-failed',
  CAMPAIGN_PROGRESS: 'campaign-progress'
}

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
}

// Configuración de archivos
export const FILE_LIMITS = {
  MAX_SIZE: 16 * 1024 * 1024, // 16MB
  ALLOWED_TYPES: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls'],
    AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
    VIDEO: ['mp4', 'avi', 'mov', 'wmv']
  }
}

// Configuración de notificaciones
export const TOAST_CONFIG = {
  TIMEOUT: 5000,
  POSITION: 'top-right'
}

// Configuración de la aplicación
export const APP_CONFIG = {
  VERSION: '1.0.0',
  AUTHOR: 'WhatsApp Sender Team',
  CONTACT_EMAIL: 'support@whatsappsender.com'
}

// Patrones de validación
export const VALIDATION_PATTERNS = {
  PHONE: /^(\+)?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ONLY_NUMBERS: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos ingresados no son válidos.',
  WHATSAPP_NOT_CONNECTED: 'WhatsApp no está conectado. Conecta primero.',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
}

// Configuración de desarrollo
export const DEBUG = {
  ENABLED: import.meta.env.MODE === 'development',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info'
}

// Export default para compatibilidad
export default {
  API_URL,
  SOCKET_URL,
  APP_NAME,
  CAMPAIGN_STATUS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_STATUS_LABELS,
  WHATSAPP_STATUS,
  MESSAGE_TYPES,
  PAGINATION,
  MESSAGE_LIMITS,
  SOCKET_EVENTS,
  USER_ROLES,
  FILE_LIMITS,
  TOAST_CONFIG,
  APP_CONFIG,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  DEBUG
}