import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { api } from '../services/api'

interface Product {
  id: string
  title?: string
  name?: string
  description?: string
  price: number
  stock: number
}

interface StoreDetails {
  id: string
  name: string
  description?: string
  city: string
  neighborhood: string
  phone?: string
  products?: Product[]
}

export function StoreDetails() {
  const route = useRoute()
  const navigation = useNavigation()
  const { storeId } = route.params as { storeId: string }

  const [store, setStore] = useState<StoreDetails | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function loadStoreDetails() {
    try {
      setLoading(true)
      const response = await api.get(`/stores/${storeId}`)
      setStore(response.data)

      if (response.data.products && Array.isArray(response.data.products)) {
        setProducts(response.data.products)
      } else {
        const productsResponse = await api.get(`/products?storeId=${storeId}`)
        setProducts(productsResponse.data)
      }
    } catch (error) {
      console.log('Erro ao carregar detalhes da loja:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStoreDetails()
  }, [storeId])

  useFocusEffect(
    useCallback(() => {
      loadStoreDetails()
    }, [storeId])
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {store && (
        <View style={styles.headerCard}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.description ? (
            <Text style={styles.storeDescription}>{store.description}</Text>
          ) : null}
          <Text style={styles.storeLocation}>
            📍 {store.neighborhood} - {store.city}
          </Text>
          {store.phone ? (
            <Text style={styles.storePhone}>📞 {store.phone}</Text>
          ) : null}
        </View>
      )}

      <Text style={styles.sectionTitle}>Produtos Disponíveis 📦</Text>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Esta loja ainda não cadastrou produtos.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            /* 🟢 CARD CLICÁVEL ADICIONADO AQUI */
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.7}
              onPress={() =>
                (navigation as any).navigate('ProductDetails', { productId: item.id })
              }
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.title || item.name}</Text>
                {item.description ? (
                  <Text style={styles.productDescription}>{item.description}</Text>
                ) : null}
                <Text style={styles.productStock}>Estoque: {item.stock} un</Text>
              </View>
              <Text style={styles.productPrice}>
                R$ {Number(item.price).toFixed(2).replace('.', ',')}
              </Text>
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
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  storeLocation: {
    fontSize: 13,
    color: '#FF6B00',
    fontWeight: '600',
    marginTop: 10,
  },
  storePhone: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B8A3E',
  },
})