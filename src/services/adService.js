// src/services/adService.js
// Servicio para integración con redes publicitarias (Applixir)

/**
 * Configuración de Applixir
 * IMPORTANTE: Debes crear una cuenta en https://www.applixir.com
 * y reemplazar estos valores con tus credenciales reales
 */
const APPLIXIR_CONFIG = {
  // Reemplaza estos valores con los de tu cuenta Applixir
  zoneId: parseInt(import.meta.env.VITE_APPLIXIR_ZONE_ID) || 0,
  devId: parseInt(import.meta.env.VITE_APPLIXIR_DEV_ID) || 0,
  gameId: parseInt(import.meta.env.VITE_APPLIXIR_GAME_ID) || 0,

  // Opciones adicionales
  fallback: 1,  // 1 = mostrar fallback si no hay anuncio disponible
  verbosity: 0  // 0 = sin logs, 1 = logs básicos, 2 = logs detallados
}

// Estado del SDK
let sdkLoaded = false
let sdkLoading = false

/**
 * Cargar el SDK de Applixir dinámicamente
 */
export const loadApplixirSdk = () => {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) {
      resolve(true)
      return
    }

    if (sdkLoading) {
      // Esperar a que termine de cargar
      const checkLoaded = setInterval(() => {
        if (sdkLoaded) {
          clearInterval(checkLoaded)
          resolve(true)
        }
      }, 100)
      return
    }

    sdkLoading = true

    // Crear elemento div requerido por Applixir
    if (!document.getElementById('applixir_vanishing_div')) {
      const div = document.createElement('div')
      div.id = 'applixir_vanishing_div'
      div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;display:none;'
      div.innerHTML = '<iframe id="applixir_parent" style="width:100%;height:100%;border:none;"></iframe>'
      document.body.appendChild(div)
    }

    // Cargar el SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.applixir.com/applixir.sdk3.0m.js'
    script.async = true

    script.onload = () => {
      sdkLoaded = true
      sdkLoading = false
      console.log('✅ [AdService] Applixir SDK cargado correctamente')
      resolve(true)
    }

    script.onerror = (error) => {
      sdkLoading = false
      console.error('❌ [AdService] Error cargando Applixir SDK:', error)
      reject(new Error('Error cargando SDK de anuncios'))
    }

    document.head.appendChild(script)
  })
}

/**
 * Mostrar un video publicitario rewarded
 * @returns {Promise<{success: boolean, reward: boolean, error?: string}>}
 */
export const showRewardedVideo = () => {
  return new Promise(async (resolve) => {
    try {
      // Verificar si las credenciales están configuradas
      if (!APPLIXIR_CONFIG.zoneId || !APPLIXIR_CONFIG.devId || !APPLIXIR_CONFIG.gameId) {
        console.warn('⚠️ [AdService] Credenciales de Applixir no configuradas. Usando modo simulación.')
        // Modo simulación para desarrollo
        resolve(await simulateRewardedVideo())
        return
      }

      // Asegurarse de que el SDK está cargado
      await loadApplixirSdk()

      // Verificar que la función existe
      if (typeof window.invokeApplixirVideoUnit !== 'function') {
        console.error('❌ [AdService] invokeApplixirVideoUnit no disponible')
        resolve(await simulateRewardedVideo())
        return
      }

      // Mostrar el div del video
      const videoDiv = document.getElementById('applixir_vanishing_div')
      if (videoDiv) {
        videoDiv.style.display = 'block'
      }

      // Configurar opciones del video
      const options = {
        zoneId: APPLIXIR_CONFIG.zoneId,
        devId: APPLIXIR_CONFIG.devId,
        gameId: APPLIXIR_CONFIG.gameId,
        fallback: APPLIXIR_CONFIG.fallback,
        verbosity: APPLIXIR_CONFIG.verbosity,
        adStatusCb: (status) => {
          console.log('📺 [AdService] Estado del anuncio:', status)

          // Ocultar el div cuando termine
          if (videoDiv && (status === 'video-closed' || status === 'video-error' || status === 'ad-rewarded')) {
            videoDiv.style.display = 'none'
          }

          switch (status) {
            case 'ad-rewarded':
              // El usuario vio el video completo - OTORGAR RECOMPENSA
              console.log('✅ [AdService] Usuario completó el video - Recompensa otorgada')
              resolve({ success: true, reward: true })
              break

            case 'video-closed':
              // El usuario cerró el video antes de terminar
              console.log('⚠️ [AdService] Usuario cerró el video')
              resolve({ success: true, reward: false, error: 'Video cerrado antes de terminar' })
              break

            case 'video-error':
            case 'network-error':
              // Error al cargar el video
              console.error('❌ [AdService] Error en el video')
              resolve({ success: false, reward: false, error: 'Error al cargar el anuncio' })
              break

            case 'ad-started':
              console.log('▶️ [AdService] Anuncio iniciado')
              break

            case 'ad-watched':
              console.log('👀 [AdService] Anuncio visto')
              break
          }
        }
      }

      // Invocar el video
      window.invokeApplixirVideoUnit(options)

    } catch (error) {
      console.error('❌ [AdService] Error mostrando video:', error)
      // Fallback a simulación
      resolve(await simulateRewardedVideo())
    }
  })
}

/**
 * Simular un video rewarded para desarrollo/pruebas
 * @returns {Promise<{success: boolean, reward: boolean}>}
 */
const simulateRewardedVideo = () => {
  return new Promise((resolve) => {
    console.log('🎬 [AdService] Modo simulación - Video simulado de 30 segundos')

    // Simular tiempo de video (reducido para pruebas)
    setTimeout(() => {
      console.log('✅ [AdService] Simulación completada - Recompensa otorgada')
      resolve({ success: true, reward: true, simulated: true })
    }, 30000) // 30 segundos de simulación
  })
}

/**
 * Verificar si hay anuncios disponibles
 * @returns {Promise<boolean>}
 */
export const checkAdAvailability = async () => {
  try {
    if (!APPLIXIR_CONFIG.zoneId) {
      return true // En modo simulación siempre hay "anuncios"
    }

    await loadApplixirSdk()

    // Applixir no tiene un método directo para verificar disponibilidad
    // Asumimos que siempre hay anuncios disponibles
    return true
  } catch (error) {
    console.error('❌ [AdService] Error verificando disponibilidad:', error)
    return true // Fallback a simulación
  }
}

/**
 * Obtener configuración actual del servicio de anuncios
 */
export const getAdConfig = () => {
  return {
    provider: 'applixir',
    configured: !!(APPLIXIR_CONFIG.zoneId && APPLIXIR_CONFIG.devId && APPLIXIR_CONFIG.gameId),
    simulationMode: !APPLIXIR_CONFIG.zoneId,
    config: {
      zoneId: APPLIXIR_CONFIG.zoneId,
      devId: APPLIXIR_CONFIG.devId,
      gameId: APPLIXIR_CONFIG.gameId
    }
  }
}

export default {
  loadApplixirSdk,
  showRewardedVideo,
  checkAdAvailability,
  getAdConfig
}
