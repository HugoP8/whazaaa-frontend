// src/services/sellersService.js
import api from './api'

export const sellersService = {
  // ========== USUARIO - CONSULTAS ==========

  /**
   * Obtener lista de vendedores disponibles (público)
   */
  async getSellers() {
    const response = await api.get('/sellers')
    return response.data
  },

  // ========== ADMIN - GESTIÓN DE VENDEDORES ==========

  /**
   * Obtener todos los vendedores (ADMIN)
   */
  async adminGetSellers() {
    const response = await api.get('/sellers/admin')
    return response.data
  },

  /**
   * Crear nuevo vendedor (ADMIN)
   */
  async adminCreateSeller(sellerData) {
    const response = await api.post('/sellers/admin', sellerData)
    return response.data
  },

  /**
   * Actualizar vendedor (ADMIN)
   */
  async adminUpdateSeller(sellerId, sellerData) {
    const response = await api.put(`/sellers/admin/${sellerId}`, sellerData)
    return response.data
  },

  /**
   * Eliminar vendedor (ADMIN)
   */
  async adminDeleteSeller(sellerId) {
    const response = await api.delete(`/sellers/admin/${sellerId}`)
    return response.data
  },

  /**
   * Obtener estadísticas de un vendedor (ADMIN)
   */
  async adminGetSellerStats(sellerId) {
    const response = await api.get(`/sellers/admin/${sellerId}/stats`)
    return response.data
  }
}
