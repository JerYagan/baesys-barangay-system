// src/api/auth.js
// Auth API helper functions
import api from './axios'

/**
 * Login with email and password
 * @returns {{ success, token, user }}
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login.php', { email, password })
  return response.data
}

/**
 * Register a new resident account
 * @returns {{ success, message }}
 */
export const register = async (data) => {
  const response = await api.post('/auth/register.php', data)
  return response.data
}

/**
 * Logout the current user
 * @returns {{ success, message }}
 */
export const logout = async () => {
  const response = await api.post('/auth/logout.php')
  return response.data
}

/**
 * Get the current authenticated user's data
 * @returns {{ success, user, resident }}
 */
export const getMe = async () => {
  const response = await api.get('/auth/me.php')
  return response.data
}
