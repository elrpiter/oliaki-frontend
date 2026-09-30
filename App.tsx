import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/contexts/AuthContext'
import { CartProvider } from './src/contexts/CartContext'
import { Routes } from './src/routes'

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <CartProvider>
        <Routes />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}