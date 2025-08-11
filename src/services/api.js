import axios from 'axios'
import { API_URL } from '@/utils/constants'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    console.log('Interceptor request:', config.url, 'Token:', token ? 'Presente' : 'No encontrado')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          break
        default:
          toast.error(error.response.data?.error || 'Error en la solicitud')
      }
    } else {
      toast.error('No se pudo conectar con el servidor')
    }
    return Promise.reject(error)
  }
)

export default api