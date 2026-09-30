import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { CreateStore } from './CreateStore'
import { CreateProduct } from './CreateProduct'
import { api } from '../services/api'

interface MyStore {
  id: string
  name: string
  city: string
  neighborhood: string
}

export function Profile() {
  const navigation = useNavigation<any>()
  const { user, signOut } = useAuth()
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [myStore, setMyStore] = useState<MyStore | null>(null)
  const [loadingStore, setLoadingStore] = useState(false)

  async function loadMyStore() {
    try {
      setLoadingStore(true)
      const response = await api.get('/stores/me')
      setMyStore(response.data)
    } catch (error) {
      console.log('Nenhuma loja própria encontrada ainda.')
      setMyStore(null)
    } finally {
      setLoadingStore(false)
    }
  }

  useEffect(() => {
    loadMyStore()
  }, [])

  function handleProductCreatedSuccess() {
    setIsProductModalOpen(false)

    // Redireciona diretamente para a tela da loja na aba Início
    if (myStore) {
      navigation.navigate('HomeTab', {
        screen: 'StoreDetails',
        params: { storeId: myStore.id },
      })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil 👤</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Tipo de Conta</Text>
        <Text style={styles.badge}>
          {myStore || user?.role === 'SELLER' ? 'Vendedor' : 'Comprador'}
        </Text>
      </View>

      {/* Seção da Loja do Vendedor */}
      {myStore ? (
        <View style={styles.storeCard}>
          <Text style={styles.sectionTitle}>Minha Loja 🏪</Text>
          {loadingStore ? (
            <ActivityIndicator color="#FF6B00" style={{ marginVertical: 10 }} />
          ) : (
            <View>
              <Text style={styles.myStoreName}>{myStore.name}</Text>
              <Text style={styles.myStoreLocation}>
                📍 {myStore.neighborhood} - {myStore.city}
              </Text>

              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => setIsProductModalOpen(true)}
              >
                <Text style={styles.addProductButtonText}>+ Cadastrar Novo Produto</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.sellerButton}
          onPress={() => setIsStoreModalOpen(true)}
        >
          <Text style={styles.sellerButtonText}>🏪 Quer vender? Abra sua Loja</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Modal Criar Loja */}
      <Modal
        visible={isStoreModalOpen}
        animationType="slide"
        onRequestClose={() => setIsStoreModalOpen(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsStoreModalOpen(false)}
          >
            <Text style={styles.closeModalText}>✕ Fechar</Text>
          </TouchableOpacity>

          <CreateStore
            onSuccess={() => {
              setIsStoreModalOpen(false)
              loadMyStore()
            }}
          />
        </View>
      </Modal>

      {/* Modal Criar Produto */}
      <Modal
        visible={isProductModalOpen}
        animationType="slide"
        onRequestClose={() => setIsProductModalOpen(false)}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setIsProductModalOpen(false)}
          >
            <Text style={styles.closeModalText}>✕ Fechar</Text>
          </TouchableOpacity>

          {myStore && (
            <CreateProduct
              storeId={myStore.id}
              onSuccess={handleProductCreatedSuccess}
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F5FF',
    color: '#1C7ED6',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  storeCard: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  myStoreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  myStoreLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    marginBottom: 12,
  },
  addProductButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerButton: {
    backgroundColor: '#2B8A3E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#E03131',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'flex-end',
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
})