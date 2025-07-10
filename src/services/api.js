import axios from 'axios'
import { API_URL } from '@/utils/constants'
import router from '@/router'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Error del servidor
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
          break
        case 403:
          toast.error('No tienes permisos para realizar esta acción')
          break
        case 404:
          toast.error('Recurso no encontrado')
          break
        case 500:
          toast.error('Error del servidor. Por favor intenta más tarde.')
          break
        default:
          toast.error(error.response.data.error || 'Error desconocido')
      }
    } else if (error.request) {
      // No hubo respuesta del servidor
      toast.error('No se pudo conectar con el servidor')
    } else {
      // Error en la configuración
      toast.error('Error en la solicitud')
    }
    
    return Promise.reject(error)
  }
)

export default api