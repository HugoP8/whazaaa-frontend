import api from './api'

export const authService = {
  async login(credentials) {
    console.log('authService.login:', credentials)
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  async changePassword(data) {
    await api.put('/auth/password', data)
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}