import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

// Configuración base para API general
const baseConfig = {
  baseURL: API_URL,
  timeout: 30000, // Aumentado a 30 segundos por defecto
  headers: {
    'Content-Type': 'application/json'
  }
}

// Instancia principal de API
const api = axios.create(baseConfig)

// Instancia especializada para operaciones de campaña con timeout extendido
export const campaignAPI = axios.create({
  ...baseConfig,
  timeout: 60000 // 60 segundos para operaciones de campaña
})

// Función para configurar interceptores comunes
const setupInterceptors = (apiInstance, instanceName = 'API') => {
  apiInstance.interceptors.request.use(
    config => {
      if (config.url?.includes('/campaigns') && instanceName === 'API') {
        config.timeout = 60000
      }

      let token = localStorage.getItem('token')
      if (token) {
        try {
          if (token.startsWith('"') && token.endsWith('"')) {
            token = JSON.parse(token)
          }
        } catch (e) {}
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    error => Promise.reject(error)
  )

  apiInstance.interceptors.response.use(
    response => {
      // Asignar role por defecto si el backend no lo envió
      if (response.config.url?.includes('/auth/login') && response.data?.user && !response.data.user.role) {
        const email = response.data.user.email || ''
        if (email.includes('superadmin')) response.data.user.role = 'superadmin'
        else if (email.includes('admin')) response.data.user.role = 'admin'
        else response.data.user.role = 'user'
      }

      // Renovación silenciosa de sesión: el backend manda un token nuevo cuando
      // al actual le queda poco tiempo. Lo guardamos sin interrumpir al usuario.
      const newToken = response.headers?.['x-new-token']
      if (newToken) {
        localStorage.setItem('token', JSON.stringify(newToken))
      }

      return response
    },
    error => {
      console.error(`[${instanceName}] Error en la respuesta:`, error.response?.status, error.response?.data)

      // Manejar timeout específicamente
      if (error.code === 'ECONNABORTED') {
        console.warn(`[${instanceName}] Timeout detectado - la operación puede continuar en segundo plano`)
        // No mostrar toast para timeout en operaciones de campaña ya que son asíncronas
        if (instanceName !== 'CampaignAPI') {
          toast.error('La operación está tomando más tiempo del esperado')
        }
      }

      // Manejar errores de red
      if (!error.response) {
        console.error(`[${instanceName}] Error de red:`, error)
        if (!error.code || error.code !== 'ECONNABORTED') {
          toast.error('No se pudo conectar con el servidor. Verifica tu conexión.')
        }
        return Promise.reject(error)
      }

      if (error.response) {
        const errorData = error.response.data
        const errorCode = errorData?.code

        switch (error.response.status) {
          case 401:
            console.warn('[API] Error 401 - Código:', errorCode)

            // Manejar códigos de error específicos
            if (errorCode === 'TOKEN_EXPIRED') {
              console.error('[API] Token expirado - redirigiendo a login')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('membership')

              if (router.currentRoute.value.path !== '/auth/login') {
                router.push('/auth/login')
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
              }
            } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'NO_TOKEN') {
              console.error('[API] Token inválido o no presente - redirigiendo a login')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('membership')

              if (router.currentRoute.value.path !== '/auth/login') {
                router.push('/auth/login')
                toast.error('Sesión inválida. Por favor, inicia sesión.')
              }
            } else {
              // Error 401 genérico
              console.warn('[API] Token inválido o expirado - limpiando sesión')
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              localStorage.removeItem('membership')

              if (router.currentRoute.value.path !== '/auth/login') {
                router.push('/auth/login')
                toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
              }
            }
            break

          case 403:
            // Verificar si es un error de límite alcanzado
            if (errorCode && errorCode.includes('LIMIT_REACHED')) {
              console.warn(`[${instanceName}] Límite alcanzado:`, errorCode, errorData)
              // No mostrar toast aquí, será manejado por el componente con el modal
              error.isLimitError = true
              error.limitData = errorData
            } else if (errorCode === 'NO_SUBSCRIPTION') {
              // Usuario sin suscripción activa
              console.warn('[API] Usuario sin suscripción activa')
              router.push('/pricing')
              toast.error('No tienes una suscripción activa. Por favor, elige un plan.')
            } else {
              toast.error('No tienes permisos para realizar esta acción')
            }
            break

          case 404:
            toast.error('Recurso no encontrado')
            break

          case 422:
            const validationError = error.response.data?.message || 'Datos de entrada inválidos'
            toast.error(validationError)
            break

          case 500:
            toast.error('Error interno del servidor')
            break

          default:
            const errorMessage = error.response.data?.message ||
                                error.response.data?.error ||
                                'Error en la solicitud'
            // Solo mostrar toast para errores no relacionados con timeout
            if (error.code !== 'ECONNABORTED') {
              toast.error(errorMessage)
            }
        }
      }

      return Promise.reject(error)
    }
  )
}

// Configurar interceptores para ambas instancias
setupInterceptors(api, 'API')
setupInterceptors(campaignAPI, 'CampaignAPI')

export default api