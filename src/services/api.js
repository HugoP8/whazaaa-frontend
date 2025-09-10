import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
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
      
      console.log('Interceptor request:', config.url, 'Token:', token ? 'Presente' : 'No encontrado')
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.log('Interceptor request:', config.url, 'Sin token')
    }
    
    return config
  },
  error => {
    console.error('Error en el interceptor de solicitud:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('Interceptor response:', response.config.url, 'Estado:', response.status)
    return response
  },
  error => {
    console.error('Error en la respuesta:', error.response?.status, error.response?.data)
    
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
          toast.error(errorMessage)
      }
    } else if (error.request) {
      // Error de red
      console.error('Error de red:', error.request)
      toast.error('No se pudo conectar con el servidor. Verifica tu conexión.')
    } else {
      // Otro tipo de error
      console.error('Error:', error.message)
      toast.error('Ocurrió un error inesperado')
    }
    
    return Promise.reject(error)
  }
)

export default api