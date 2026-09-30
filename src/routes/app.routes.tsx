import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Home } from '../screens/Home'
import { StoreDetails } from '../screens/StoreDetails'
import { ProductDetails } from '../screens/ProductDetails'
import { Cart } from '../screens/Cart'
import { Orders } from '../screens/Orders'
import { Profile } from '../screens/Profile'
import { useCart } from '../contexts/CartContext'

export type HomeStackParamList = {
  HomeList: undefined
  StoreDetails: { storeId: string }
  ProductDetails: { productId: string }
}

const HomeStack = createNativeStackNavigator<HomeStackParamList>()

function HomeStackRoutes() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeList" component={Home} />
      <HomeStack.Screen name="StoreDetails" component={StoreDetails} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetails} />
    </HomeStack.Navigator>
  )
}

const Tab = createBottomTabNavigator()

export function AppRoutes() {
  const insets = useSafeAreaInsets()
  const { totalItems } = useCart()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackRoutes}
        options={{
          tabBarLabel: 'Início',
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={Cart}
        options={{
          tabBarLabel: 'Carrinho',
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={Orders}
        options={{
          tabBarLabel: 'Pedidos',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  )
}