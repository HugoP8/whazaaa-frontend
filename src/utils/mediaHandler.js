// src/utils/mediaHandler.js
import { FILE_LIMITS } from '@/utils/constants'
import { useToast } from 'vue-toastification'

const toast = useToast()

/**
 * Clase moderna para manejar archivos multimedia
 */
export class MediaHandler {
  constructor(options = {}) {
    this.maxSize = options.maxSize || FILE_LIMITS.MAX_SIZE
    this.allowedTypes = options.allowedTypes || this.getDefaultAllowedTypes()
    this.showToast = options.showToast !== false
  }

  /**
   * Obtiene los tipos MIME permitidos por defecto
   */
  getDefaultAllowedTypes() {
    return {
      mimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/avi', 'video/mov', 'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'avi', 'mov', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
    }
  }

  /**
   * Valida un archivo individual
   * @param {File} file - Archivo a validar
   * @returns {Object} - Resultado de la validación
   */
  validateFile(file) {
    if (!file || !(file instanceof File)) {
      return {
        isValid: false,
        error: 'Archivo no válido',
        errorType: 'INVALID_FILE'
      }
    }

    // Validar tamaño
    if (file.size > this.maxSize) {
      const maxSizeMB = Math.round(this.maxSize / 1024 / 1024)
      return {
        isValid: false,
        error: `Archivo demasiado grande. Máximo ${maxSizeMB}MB`,
        errorType: 'FILE_TOO_LARGE',
        maxSize: this.maxSize,
        actualSize: file.size
      }
    }

    // Validar tipo
    const isValidMimeType = this.allowedTypes.mimeTypes.includes(file.type)
    const extension = file.name.split('.').pop()?.toLowerCase()
    const isValidExtension = this.allowedTypes.extensions.includes(extension)

    if (!isValidMimeType && !isValidExtension) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Usa JPG, PNG, MP4, PDF, DOC o DOCX',
        errorType: 'INVALID_FILE_TYPE',
        allowedTypes: this.allowedTypes,
        actualType: file.type,
        actualExtension: extension
      }
    }

    return {
      isValid: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        lastModified: new Date(file.lastModified),
        isImage: this.isImageFile(file),
        isVideo: this.isVideoFile(file),
        isDocument: this.isDocumentFile(file)
      }
    }
  }

  /**
   * Valida archivos de un FileList o Array
   * @param {FileList|Array} files - Archivos a validar
   * @returns {Object} - Resultado de la validación
   */
  validateFiles(files) {
    // Manejo de casos null/undefined/vacío
    if (!files) {
      return {
        isValid: true,
        validFiles: [],
        invalidFiles: [],
        totalFiles: 0,
        validCount: 0,
        errorCount: 0,
        message: 'No se proporcionaron archivos'
      }
    }

    // Convertir FileList a array si es necesario
    let fileArray = files
    if (files instanceof FileList) {
      fileArray = Array.from(files)
    } else if (!Array.isArray(files)) {
      fileArray = [files]
    }

    // Filtrar archivos válidos (no null/undefined)
    fileArray = fileArray.filter(file => file != null)

    if (fileArray.length === 0) {
      return {
        isValid: true,
        validFiles: [],
        invalidFiles: [],
        totalFiles: 0,
        validCount: 0,
        errorCount: 0,
        message: 'No hay archivos válidos para validar'
      }
    }

    const validatedFiles = []
    const errors = []

    fileArray.forEach((file, i) => {
      // Verificación adicional de que el archivo es válido
      if (!file || !(file instanceof File)) {
        errors.push({
          index: i,
          fileName: 'Archivo no válido',
          isValid: false,
          error: 'El archivo no es válido',
          errorType: 'INVALID_FILE'
        })
        return
      }

      const validation = this.validateFile(file)

      if (validation.isValid) {
        validatedFiles.push(validation.file)
      } else {
        errors.push({
          index: i,
          fileName: file.name || 'Archivo desconocido',
          ...validation
        })
      }
    })

    const result = {
      isValid: errors.length === 0,
      validFiles: validatedFiles,
      invalidFiles: errors,
      totalFiles: fileArray.length,
      validCount: validatedFiles.length,
      errorCount: errors.length
    }

    // Mostrar toasts si está habilitado
    if (this.showToast) {
      if (result.isValid && result.validCount > 0) {
        toast.success(`${result.validCount} archivo(s) válido(s)`)
      } else if (result.errorCount > 0) {
        errors.forEach(error => {
          toast.error(error.error)
        })
      }
    }

    return result
  }

  /**
   * Procesa archivos para FormData
   * @param {FileList|Array|File} files - Archivos a procesar
   * @returns {Object} - Datos procesados
   */
  processFilesForFormData(files) {
    let fileList = files

    // Normalizar entrada
    if (files instanceof File) {
      fileList = [files]
    } else if (files instanceof FileList) {
      fileList = Array.from(files)
    }

    const validation = this.validateFiles(fileList)

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.invalidFiles,
        message: `${validation.errorCount} archivo(s) con errores`
      }
    }

    return {
      success: true,
      files: validation.validFiles,
      message: `${validation.validCount} archivo(s) procesado(s) correctamente`
    }
  }

  /**
   * Crea FormData con archivos y datos adicionales
   * @param {Object} data - Datos base
   * @param {FileList|Array|File} files - Archivos a agregar
   * @param {Object} options - Opciones adicionales
   * @returns {FormData} - FormData construido
   */
  createFormData(data = {}, files = null, options = {}) {
    const formData = new FormData()

    // Agregar datos básicos
    Object.keys(data).forEach(key => {
      const value = data[key]

      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })

    // Procesar archivos
    if (files) {
      const processed = this.processFilesForFormData(files)

      if (processed.success) {
        processed.files.forEach((fileInfo, index) => {
          const actualFile = Array.from(files)[index]
          const fieldName = options.fileFieldName || (processed.files.length > 1 ? `media_${index}` : 'media')
          formData.append(fieldName, actualFile)
        })
      } else {
        throw new Error(`Error procesando archivos: ${processed.message}`)
      }
    }

    // Log para debugging (solo en desarrollo)
    if (import.meta.env.MODE === 'development') {
      console.log('[MediaHandler] FormData creado:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }
    }

    return formData
  }

  /**
   * Verifica si un archivo es una imagen
   * @param {File} file - Archivo a verificar
   * @returns {boolean}
   */
  isImageFile(file) {
    if (!file || !file.type) return false
    return file.type.startsWith('image/')
  }

  /**
   * Verifica si un archivo es un video
   * @param {File} file - Archivo a verificar
   * @returns {boolean}
   */
  isVideoFile(file) {
    if (!file || !file.type) return false
    return file.type.startsWith('video/')
  }

  /**
   * Verifica si un archivo es un documento
   * @param {File} file - Archivo a verificar
   * @returns {boolean}
   */
  isDocumentFile(file) {
    if (!file || !file.type) return false
    return file.type.startsWith('application/') || file.type === 'text/plain'
  }

  /**
   * Genera información de previsualización para archivos
   * @param {File} file - Archivo para previsualizar
   * @returns {Promise<Object>} - Información de previsualización
   */
  async generatePreview(file) {
    const validation = this.validateFile(file)

    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const preview = {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified),
      ...validation.file
    }

    // Generar data URL para imágenes
    if (this.isImageFile(file)) {
      try {
        preview.dataUrl = await this.fileToDataURL(file)
      } catch (error) {
        console.warn('[MediaHandler] Error generando preview de imagen:', error)
      }
    }

    return preview
  }

  /**
   * Convierte un archivo a Data URL
   * @param {File} file - Archivo a convertir
   * @returns {Promise<string>} - Data URL
   */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Limpia recursos y referencias
   */
  cleanup() {
    // Limpiar referencias si es necesario
    this.allowedTypes = null
  }
}

/**
 * Instancia singleton para uso global
 */
export const mediaHandler = new MediaHandler()

/**
 * Factory function para crear instancias personalizadas
 */
export const createMediaHandler = (options) => new MediaHandler(options)

/**
 * Funciones de utilidad directas para compatibilidad
 */
export const validateFile = (file, options = {}) => {
  const handler = new MediaHandler(options)
  return handler.validateFile(file)
}

export const createFormDataWithMedia = (data, files, options = {}) => {
  const handler = new MediaHandler(options)
  return handler.createFormData(data, files, options)
}

export const formatFileSize = (bytes) => {
  const handler = new MediaHandler()
  return handler.formatFileSize(bytes)
}

export default MediaHandler