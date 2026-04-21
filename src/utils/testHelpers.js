// src/utils/testHelpers.js
// Utilidades para testing y debugging

/**
 * Crea un archivo de prueba para testing
 * @param {string} name - Nombre del archivo
 * @param {string} content - Contenido del archivo
 * @param {string} type - Tipo MIME
 * @returns {File} - Archivo de prueba
 */
export const createTestFile = (name = 'test.jpg', content = 'fake image content', type = 'image/jpeg') => {
  const blob = new Blob([content], { type })
  return new File([blob], name, { type, lastModified: Date.now() })
}

/**
 * Simula la selección de archivo en un input
 * @param {HTMLInputElement} input - Input file
 * @param {File} file - Archivo a simular
 */
export const simulateFileSelection = (input, file) => {
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  input.files = dataTransfer.files

  // Disparar evento change
  const event = new Event('change', { bubbles: true })
  input.dispatchEvent(event)
}

/**
 * Inspecciona el contenido de un FormData
 * @param {FormData} formData - FormData a inspeccionar
 * @returns {Object} - Contenido del FormData
 */
export const inspectFormData = (formData) => {
  const result = {
    fields: {},
    files: {},
    entries: []
  }

  for (let [key, value] of formData.entries()) {
    result.entries.push({ key, value })

    if (value instanceof File) {
      result.files[key] = {
        name: value.name,
        size: value.size,
        type: value.type,
        lastModified: new Date(value.lastModified)
      }
    } else {
      result.fields[key] = value
    }
  }

  return result
}

/**
 * Genera datos de campaña de prueba
 * @param {Object} overrides - Propiedades a sobrescribir
 * @returns {Object} - Datos de campaña de prueba
 */
export const createTestCampaignData = (overrides = {}) => {
  return {
    name: 'Campaña de Prueba',
    message: 'Este es un mensaje de prueba',
    recipients: ['1234567890@c.us'],
    type: 'contacts',
    delay: 5000,
    ...overrides
  }
}

/**
 * Genera archivo de imagen de prueba
 * @param {Object} options - Opciones del archivo
 * @returns {File} - Archivo de imagen de prueba
 */
export const createTestImage = (options = {}) => {
  const {
    name = 'test-image.jpg',
    width = 100,
    height = 100,
    type = 'image/jpeg'
  } = options

  // Crear canvas y generar imagen de prueba
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Dibujar un gradiente simple
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#FF6B6B')
  gradient.addColorStop(1, '#4ECDC4')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Agregar texto
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('TEST', width / 2, height / 2)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], name, { type, lastModified: Date.now() }))
    }, type, 0.9)
  })
}

/**
 * Valida que un FormData contenga los campos esperados
 * @param {FormData} formData - FormData a validar
 * @param {Array} expectedFields - Campos esperados
 * @returns {Object} - Resultado de validación
 */
export const validateFormData = (formData, expectedFields = []) => {
  const inspection = inspectFormData(formData)
  const result = {
    isValid: true,
    missing: [],
    extra: [],
    files: inspection.files,
    fields: inspection.fields
  }

  // Verificar campos requeridos
  expectedFields.forEach(field => {
    if (!inspection.fields.hasOwnProperty(field) && !inspection.files.hasOwnProperty(field)) {
      result.missing.push(field)
      result.isValid = false
    }
  })

  return result
}

/**
 * Mock para MediaHandler en tests
 */
export class MockMediaHandler {
  validateFile(file) {
    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        isImage: file.type.startsWith('image/'),
        isVideo: file.type.startsWith('video/'),
        isDocument: !file.type.startsWith('image/') && !file.type.startsWith('video/')
      }
    }
  }

  validateFiles(files) {
    return {
      isValid: true,
      validFiles: Array.from(files).map(file => this.validateFile(file).file),
      invalidFiles: [],
      validCount: files.length,
      errorCount: 0
    }
  }

  createFormData(data, files) {
    const formData = new FormData()

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && !Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]))
      } else if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]))
      } else {
        formData.append(key, data[key])
      }
    })

    if (files) {
      Array.from(files).forEach(file => {
        formData.append('media', file)
      })
    }

    return formData
  }
}

/**
 * Logging helpers para debugging
 */
export const debugLog = {
  campaign: (data) => {
    console.group('🚀 Campaign Debug')
    console.log('Data:', data)
    console.log('Type:', typeof data)
    if (data instanceof FormData) {
      console.log('FormData contents:', inspectFormData(data))
    }
    console.groupEnd()
  },

  file: (file) => {
    console.group('📁 File Debug')
    console.log('Name:', file?.name)
    console.log('Size:', file?.size, 'bytes')
    console.log('Type:', file?.type)
    console.log('Last Modified:', new Date(file?.lastModified))
    console.groupEnd()
  },

  validation: (result) => {
    console.group('✅ Validation Debug')
    console.log('Is Valid:', result.isValid)
    console.log('Valid Files:', result.validFiles?.length || 0)
    console.log('Invalid Files:', result.invalidFiles?.length || 0)
    if (result.invalidFiles?.length > 0) {
      console.log('Errors:', result.invalidFiles)
    }
    console.groupEnd()
  }
}

export default {
  createTestFile,
  simulateFileSelection,
  inspectFormData,
  createTestCampaignData,
  createTestImage,
  validateFormData,
  MockMediaHandler,
  debugLog
}