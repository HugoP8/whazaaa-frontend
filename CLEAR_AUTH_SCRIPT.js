/**
 * SCRIPT DE LIMPIEZA DE AUTENTICACIÓN
 * 
 * Ejecuta este código en la consola del navegador (F12) para limpiar completamente
 * todos los datos de autenticación y reiniciar la sesión.
 * 
 * INSTRUCCIONES:
 * 1. Abre las herramientas de desarrollador (F12)
 * 2. Ve a la pestaña "Console"
 * 3. Copia y pega todo este código
 * 4. Presiona Enter
 * 5. Recarga la página (F5)
 */

console.log('🧹 Iniciando limpieza completa de autenticación...')

// 1. Limpiar localStorage
console.log('📦 Limpiando localStorage...')
const localStorageKeys = ['token', 'user', 'refreshToken', 'sessionId', 'whatsapp-connection', 'auth-data']
localStorageKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`  ✅ Removiendo localStorage.${key}`)
    localStorage.removeItem(key)
  }
})

// 2. Limpiar sessionStorage
console.log('📋 Limpiando sessionStorage...')
const sessionStorageKeys = ['token', 'user', 'tempAuth']
sessionStorageKeys.forEach(key => {
  if (sessionStorage.getItem(key)) {
    console.log(`  ✅ Removiendo sessionStorage.${key}`)
    sessionStorage.removeItem(key)
  }
})

// 3. Limpiar cookies (si las hay)
console.log('🍪 Limpiando cookies...')
const cookiesToClear = ['auth-token', 'session-id', 'user-data']
cookiesToClear.forEach(cookieName => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  console.log(`  ✅ Removiendo cookie ${cookieName}`)
})

// 4. Limpiar estado de Vuex (si está disponible)
if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ && window.$vm && window.$vm.$store) {
  console.log('🗄️ Limpiando estado de Vuex...')
  try {
    window.$vm.$store.dispatch('auth/logout').catch(() => {})
    window.$vm.$store.commit('auth/CLEAR_AUTH')
    console.log('  ✅ Estado de autenticación limpiado')
  } catch (error) {
    console.log('  ⚠️ No se pudo limpiar Vuex:', error.message)
  }
} else {
  console.log('🗄️ Vuex no detectado o no accesible')
}

// 5. Mostrar estado actual
console.log('\n📊 ESTADO DESPUÉS DE LA LIMPIEZA:')
console.log('localStorage.token:', localStorage.getItem('token') || '❌ No encontrado')
console.log('localStorage.user:', localStorage.getItem('user') || '❌ No encontrado')
console.log('sessionStorage.token:', sessionStorage.getItem('token') || '❌ No encontrado')

// 6. Recomendaciones
console.log('\n✅ LIMPIEZA COMPLETADA!')
console.log('🔄 PRÓXIMOS PASOS:')
console.log('1. Recarga la página (F5)')
console.log('2. Deberías ser redirigido al login')
console.log('3. Inicia sesión nuevamente')
console.log('4. Si persisten los problemas, cierra y abre el navegador')

// 7. Auto-reload opcional (descomenta la siguiente línea si quieres que se recargue automáticamente)
// window.location.reload()

console.log('🎉 ¡Listo! La autenticación ha sido completamente limpiada.')