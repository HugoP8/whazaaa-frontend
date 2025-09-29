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
      // Para rutas de campaigns, aumentar timeout automáticamente
      if (config.url?.includes('/campaigns') && instanceName === 'API') {
        config.timeout = 60000; // 60 segundos para operaciones de campañas
        console.log(`[${instanceName}] Timeout extendido para campaña:`, config.url)
      }

      // Obtener token del localStorage (puede estar como string o JSON)
      let token = localStorage.getItem('token')

      if (token) {
        try {
          // Si está guardado como JSON, parsearlo
          const parsed = JSON.parse(token)
          token = typeof parsed === 'string' ? parsed : token
        } catch (e) {
          // Si no es JSON, usarlo tal como está
          // token ya tiene el valor correcto
        }

        console.log(`[${instanceName}] Interceptor request:`, config.url, 'Token:', token ? 'Presente' : 'No encontrado')
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log(`[${instanceName}] Interceptor request:`, config.url, 'Sin token')
      }

      return config
    },
    error => {
      console.error(`[${instanceName}] Error en el interceptor de solicitud:`, error)
      return Promise.reject(error)
    }
  )

  apiInstance.interceptors.response.use(
    response => {
      console.log(`[${instanceName}] Interceptor response:`, response.config.url, 'Estado:', response.status)
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
        switch (error.response.status) {
          case 401:
            console.warn('Token inválido o expirado - limpiando sesión')

            // Limpiar localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // Redirigir a login si no estamos ya ahí
            if (router.currentRoute.value.path !== '/auth/login') {
              router.push('/auth/login')
              toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
            }
            break

          case 403:
            toast.error('No tienes permisos para realizar esta acción')
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