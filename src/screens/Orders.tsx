import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface OrderItem {
  id: string
  quantity: number
  unitPrice?: number | string
  price?: number | string
  product?: {
    title?: string
    name?: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount?: number | string
  total?: number | string
  createdAt: string
  store?: {
    name: string
  }
  user?: {
    name: string
  }
  items?: OrderItem[]
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pendente ⏳', color: '#D97706', bg: '#FEF3C7' },
  IN_PREPARATION: { label: 'Em Preparo 👨‍🍳', color: '#2563EB', bg: '#DBEAFE' },
  DELIVERED: { label: 'Entregue ✅', color: '#16A34A', bg: '#DCFCE7' },
  CANCELLED: { label: 'Cancelado ❌', color: '#DC2626', bg: '#FEE2E2' },
}

function showAlert(title: string, message: string, onPressOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`)
    if (onPressOk) onPressOk()
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onPressOk }])
  }
}

export function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchOrders() {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      console.log('📋 Pedidos retornados do backend:', JSON.stringify(response.data, null, 2))
      const fetchedOrders = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || []
      setOrders(fetchedOrders)
    } catch (error) {
      console.log('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchOrders()
    }, [])
  )

  function handleRefresh() {
    setRefreshing(true)
    fetchOrders()
  }

  async function handleUpdateStatus(orderId: string, newStatus: string) {
    try {
      setUpdatingId(orderId)
      console.log(`🔄 Atualizando status do pedido ${orderId} para: ${newStatus}`)
      
      const response = await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      console.log('✅ Resposta da atualização:', response.data)

      showAlert('Sucesso! 🎉', 'Status do pedido atualizado com sucesso.', () => {
        fetchOrders()
      })
    } catch (error: any) {
      console.log('--- ERRO AO ATUALIZAR STATUS DO PEDIDO ---')
      console.log(JSON.stringify(error.response?.data || error.message, null, 2))
      
      const message =
        error.response?.data?.message || 'Não foi possível alterar o status do pedido.'
      showAlert('Erro', message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Pedidos 📋</Text>
      <Text style={styles.headerSubtitle}>Acompanhe suas compras e vendas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FF6B00']}
            />
          }
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusInfo = STATUS_LABELS[item.status] || {
              label: item.status,
              color: '#4B5563',
              bg: '#F3F4F6',
            }

            // Garante leitura correta do totalAmount (backend Prisma) ou total
            const rawTotal = item.totalAmount ?? item.total
            const calculatedTotal =
              rawTotal !== undefined && rawTotal !== null
                ? Number(rawTotal)
                : item.items?.reduce((sum, i) => {
                    const price = Number(i.unitPrice ?? i.price ?? 0)
                    return sum + price * i.quantity
                  }, 0) ?? 0

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>
                    Pedido #{item.id.substring(0, 8)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {item.store ? (
                  <Text style={styles.storeTag}>🏪 Loja: {item.store.name}</Text>
                ) : null}

                {item.user ? (
                  <Text style={styles.buyerTag}>👤 Cliente: {item.user.name}</Text>
                ) : null}

                {/* Itens do Pedido com leitura de unitPrice e price */}
                {item.items && item.items.length > 0 && (
                  <View style={styles.itemsSection}>
                    {item.items.map((orderItem) => {
                      const unitPriceNum = Number(orderItem.unitPrice ?? orderItem.price ?? 0)
                      const itemTotal = unitPriceNum * orderItem.quantity

                      return (
                        <Text key={orderItem.id} style={styles.itemRow}>
                          • {orderItem.quantity}x {orderItem.product?.title || orderItem.product?.name || 'Item'} - R${' '}
                          {itemTotal.toFixed(2).replace('.', ',')}
                        </Text>
                      )
                    })}
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>
                    R$ {calculatedTotal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>

                {/* Ações para Vendedor (Mudar Status) */}
                {user?.role === 'SELLER' && item.status !== 'DELIVERED' && item.status !== 'CANCELLED' && (
                  <View style={styles.actionsContainer}>
                    <Text style={styles.actionsTitle}>Atualizar Status:</Text>
                    <View style={styles.actionButtonsRow}>
                      {item.status === 'PENDING' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
                          onPress={() => handleUpdateStatus(item.id, 'IN_PREPARATION')}
                          disabled={updatingId === item.id}
                        >
                          {updatingId === item.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.actionBtnText}>Em Preparo</Text>
                          )}
                        </TouchableOpacity>
                      )}

                      {item.status === 'IN_PREPARATION' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#16A34A' }]}
                          onPress={() => handleUpdateStatus(item.id, 'DELIVERED')}
                          disabled={updatingId === item.id}
                        >
                          {updatingId === item.id ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Text style={styles.actionBtnText}>Marcar Entregue</Text>
                          )}
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#DC2626' }]}
                        onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                        disabled={updatingId === item.id}
                      >
                        {updatingId === item.id ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.actionBtnText}>Cancelar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )
          }}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeTag: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  buyerTag: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  itemsSection: {
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F3F5',
  },
  itemRow: {
    fontSize: 13,
    color: '#555',
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2B8A3E',
  },
  actionsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  actionsTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
})