import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../contexts/CartContext'
import { api } from '../services/api'

function showAlert(title: string, message: string, onPressOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`)
    if (onPressOk) onPressOk()
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onPressOk }])
  }
}

export function Cart() {
  const navigation = useNavigation<any>()
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart()

  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'LOCAL_DELIVERY'>('PICKUP')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (cart.length === 0) {
      return showAlert('Carrinho Vazio', 'Adicione produtos ao carrinho antes de finalizar.')
    }

    try {
      setLoading(true)

      const primaryStoreId = cart[0]?.storeId

      if (!primaryStoreId) {
        return showAlert(
          'Atenção',
          'Não foi possível identificar a loja deste produto. Remova o item e adicione-o novamente.'
        )
      }

      if (deliveryMethod === 'LOCAL_DELIVERY' && !deliveryAddress.trim()) {
        return showAlert('Atenção', 'Informe o endereço de entrega para a opção de Entrega Local.')
      }

      const payload = {
        storeId: primaryStoreId,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'LOCAL_DELIVERY' ? deliveryAddress.trim() : undefined,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      console.log('🚀 Enviando pedido para /orders:', JSON.stringify(payload, null, 2))

      await api.post('/orders', payload)

      showAlert('Pedido Realizado! 🎉', 'Seu pedido foi enviado com sucesso.', () => {
        clearCart()
        navigation.navigate('OrdersTab')
      })
    } catch (error: any) {
      console.log('--- ERRO AO FINALIZAR PEDIDO ---', error.response?.data || error.message)
      const responseData = error.response?.data
      const message = responseData?.message || 'Não foi possível finalizar o pedido.'
      showAlert('Erro ao Finalizar', message)
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySubtitle}>
          Navegue pelas lojas e adicione produtos ao seu carrinho.
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.exploreButtonText}>Explorar Produtos</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Carrinho 🛒</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Forma de Entrega / Retirada 🚚</Text>

            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  deliveryMethod === 'PICKUP' && styles.optionButtonSelected,
                ]}
                onPress={() => setDeliveryMethod('PICKUP')}
              >
                <Text
                  style={[
                    styles.optionText,
                    deliveryMethod === 'PICKUP' && styles.optionTextSelected,
                  ]}
                >
                  🏪 Retirar na Loja
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  deliveryMethod === 'LOCAL_DELIVERY' && styles.optionButtonSelected,
                ]}
                onPress={() => setDeliveryMethod('LOCAL_DELIVERY')}
              >
                <Text
                  style={[
                    styles.optionText,
                    deliveryMethod === 'LOCAL_DELIVERY' && styles.optionTextSelected,
                  ]}
                >
                  🛵 Entrega Local
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryMethod === 'LOCAL_DELIVERY' && (
              <TextInput
                style={styles.addressInput}
                placeholder="Informe seu endereço completo (rua, número, bairro)..."
                placeholderTextColor="#999"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999
          const isMaxStock = item.quantity >= maxStock

          return (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.storeName}>🏪 {item.storeName}</Text>
              {typeof item.stock === 'number' && (
                <Text style={styles.stockInfo}>Max disponível: {item.stock} un</Text>
              )}

              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </Text>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtyValue}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={[styles.qtyButton, isMaxStock && styles.qtyButtonDisabled]}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isMaxStock}
                  >
                    <Text style={[styles.qtyButtonText, isMaxStock && styles.qtyButtonTextDisabled]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        }}
      />

      {/* Resumo e Botão de Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total do Pedido:</Text>
          <Text style={styles.totalAmount}>
            R$ {totalAmount.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  clearText: {
    color: '#E03131',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F8F9FA',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  removeText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  stockInfo: {
    fontSize: 11,
    color: '#0CA678',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B8A3E',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  qtyButtonTextDisabled: {
    color: '#ADB5BD',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#333',
  },
  deliverySection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CED4DA',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  optionButtonSelected: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFF4E6',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  optionTextSelected: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  addressInput: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2B8A3E',
  },
  checkoutButton: {
    backgroundColor: '#2B8A3E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})