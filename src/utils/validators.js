export const required = (value) => {
  return value ? true : 'Este campo es requerido'
}

export const email = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Email inválido'
}

export const minLength = (min) => (value) => {
  return value?.length >= min || `Mínimo ${min} caracteres`
}

export const maxLength = (max) => (value) => {
  return value?.length <= max || `Máximo ${max} caracteres`
}

export const phoneNumber = (value) => {
  const pattern = /^\+?[1-9]\d{8,14}$/
  return pattern.test(value) || 'Número de teléfono inválido'
}

export const fileSize = (maxSize) => (files) => {
  if (!files || files.length === 0) return true
  const file = files[0]
  return file.size <= maxSize || `El archivo debe ser menor a ${maxSize / 1024 / 1024}MB`
}

export const fileType = (allowedTypes) => (files) => {
  if (!files || files.length === 0) return true
  const file = files[0]
  return allowedTypes.includes(file.type) || 'Tipo de archivo no permitido'
}

export const campaignName = (value) => {
  if (!value) return 'El nombre de la campaña es requerido'
  if (value.length < 3) return 'Mínimo 3 caracteres'
  if (value.length > 100) return 'Máximo 100 caracteres'
  return true
}

export const messageContent = (value) => {
  if (!value) return 'El mensaje es requerido'
  if (value.length < 1) return 'El mensaje no puede estar vacío'
  if (value.length > 4096) return 'Máximo 4096 caracteres'
  return true
}

export const recipientsList = (value) => {
  if (!value || value.length === 0) return 'Debes seleccionar al menos un destinatario'
  return true
}