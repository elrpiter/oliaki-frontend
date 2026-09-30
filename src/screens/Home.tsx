import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { HomeStackParamList } from '../routes/app.routes'
import { api } from '../services/api'

interface Store {
  id: string
  name: string
  description?: string
  city: string
  neighborhood: string
  phone?: string
}

type NavigationProps = NativeStackNavigationProp<HomeStackParamList, 'HomeList'>

export function Home() {
  const navigation = useNavigation<NavigationProps>()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchStores() {
    try {
      const response = await api.get('/stores')
      if (Array.isArray(response.data)) {
        setStores(response.data)
      } else if (response.data && Array.isArray(response.data.stores)) {
        setStores(response.data.stores)
      } else {
        setStores([])
      }
    } catch (error) {
      console.log('Erro ao buscar lojas:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchStores()
    }, [])
  )

  function handleRefresh() {
    setRefreshing(true)
    fetchStores()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lojas na sua Região 🏪</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B00" style={styles.loader} />
      ) : stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma loja encontrada na sua cidade.</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FF6B00']}
            />
          }
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('StoreDetails', { storeId: item.id })
              }
            >
              <Text style={styles.storeName}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.storeDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.storeLocation}>
                📍 {item.neighborhood} - {item.city}
              </Text>
              {item.phone ? (
                <Text style={styles.storePhone}>📞 {item.phone}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  storeLocation: {
    fontSize: 13,
    color: '#FF6B00',
    fontWeight: '600',
    marginTop: 8,
  },
  storePhone: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
})