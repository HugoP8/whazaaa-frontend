// Utilidades para manejo de autenticación

/**
 * Limpiar completamente el localStorage de datos de autenticación
 */
export const clearAuthData = () => {
  console.log('[Auth Utils] Limpiando datos de autenticación')
  
  // Lista de claves que pueden contener datos de auth
  const authKeys = ['token', 'user', 'refreshToken', 'sessionId']
  
  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`[Auth Utils] Removiendo ${key}`)
      localStorage.removeItem(key)
    }
  })
  
  // También limpiar sessionStorage por si acaso
  authKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      console.log(`[Auth Utils] Removiendo ${key} de sessionStorage`)
      sessionStorage.removeItem(key)
    }
  })
}

/**
 * Verificar si un token JWT está expirado
 */
export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    // Decodificar el payload del JWT sin verificar la firma
    const base64Url = token.split('.')[1]
    if (!base64Url) return true
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join('')
    )
    
    const payload = JSON.parse(jsonPayload)
    const currentTime = Math.floor(Date.now() / 1000)
    
    return payload.exp < currentTime
  } catch (error) {
    console.error('[Auth Utils] Error verificando token:', error)
    return true
  }
}

/**
 * Obtener información del token JWT
 */
export const getTokenInfo = (token) => {
  if (!token) return null
  
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('[Auth Utils] Error obteniendo info del token:', error)
    return null
  }
}

/**
 * Verificar si hay datos de autenticación válidos en localStorage
 */
export const hasValidAuthData = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (!token || !user) return false
  
  try {
    // Intentar parsear el token si está como JSON
    let parsedToken = token
    try {
      parsedToken = JSON.parse(token)
    } catch (e) {
      // Token no es JSON, usar como está
    }
    
    // Verificar si el token no está expirado
    if (isTokenExpired(parsedToken)) {
      console.log('[Auth Utils] Token expirado')
      return false
    }
    
    // Intentar parsear el usuario
    JSON.parse(user)
    
    return true
  } catch (error) {
    console.error('[Auth Utils] Datos de auth inválidos:', error)
    return false
  }
}

export default {
  clearAuthData,
  isTokenExpired,
  getTokenInfo,
  hasValidAuthData
}