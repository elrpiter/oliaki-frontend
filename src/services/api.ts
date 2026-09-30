import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {Platform} from 'react-native'

// Substitua pelo IP da sua rede local (ex: http://192.168.1.15:3333)
export const API_URL = 'http://192.168.1.74:3333' // URL da API do backend

export const api = axios.create({
  baseURL: Platform.OS === 'web' 
    ? 'http://localhost:3333' 
    : 'http://192.168.1.74:3333', // IP local para o telemóvel
})

// Injeta o Token JWT em todas as requisições autenticadas automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@oliaki:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error)
  }
)