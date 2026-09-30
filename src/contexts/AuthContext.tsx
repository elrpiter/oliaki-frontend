import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../services/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@oliaki:token')
        const storedUser = await AsyncStorage.getItem('@oliaki:user')

        if (storedToken && storedUser) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Erro ao carregar sessão armazenada:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStorageData()
  }, [])

  async function signIn({ email, password }: { email: string; password: string }) {
    const response = await api.post('/sessions', { email, password })
    const { token, user: loggedUser } = response.data

    await AsyncStorage.setItem('@oliaki:token', token)
    await AsyncStorage.setItem('@oliaki:user', JSON.stringify(loggedUser))

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(loggedUser)
  }

  async function signOut() {
    await AsyncStorage.removeItem('@oliaki:token')
    await AsyncStorage.removeItem('@oliaki:user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}