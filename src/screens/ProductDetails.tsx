import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { api } from '../services/api'

interface ProductDetailsData {
    id: string
    title?: string
    name?: string
    description?: string
    price: number | string
    stock?: number
    store?: {
        id: string
        name: string
        neighborhood: string
        city: string
        phone?: string
    }
}

export function ProductDetails() {
    const route = useRoute()
    const navigation = useNavigation()
    const { productId } = route.params as { productId: string }
    const { addToCart } = useCart()

    const [product, setProduct] = useState<ProductDetailsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)

    async function loadProductDetails() {
        try {
            setLoading(true)
            const response = await api.get(`/products/${productId}`)

            // 🟢 Extrai o produto independentemente do formato retornado pelo backend ({ product: {...} } ou {...})
            const fetchedProduct = response.data?.product || response.data
            console.log('📦 Produto carregado:', fetchedProduct)

            setProduct(fetchedProduct)
        } catch (error) {
            console.log('Erro ao carregar produto:', error)
            Alert.alert('Erro', 'Não foi possível carregar as informações do produto.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (productId) {
            loadProductDetails()
        }
    }, [productId])

    function handleAddToCart() {
        if (!product) return

        const productName = product.title || product.name || 'Produto'
        const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')

        addToCart(
            {
                id: product.id,
                title: productName,
                price: numericPrice,
                storeId: product.store?.id || '',
                storeName: product.store?.name || 'Loja Local',
                stock: stockQuantity,
            },
            quantity
        )

        Alert.alert(
            'Adicionado! 🛒',
            `${quantity}x "${productName}" foi adicionado ao seu carrinho.`
        )
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B00" />
            </View>
        )
    }

    if (!product) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Produto não encontrado.</Text>
            </View>
        )
    }

    const stockQuantity = typeof product.stock === 'number' ? product.stock : 0
    const productName = product.title || product.name || 'Produto sem título'
    const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>{productName}</Text>

                    {product.store && (
                        <TouchableOpacity
                            onPress={() =>
                                (navigation as any).navigate('StoreDetails', { storeId: product.store?.id })
                            }
                        >
                            <Text style={styles.storeTag}>
                                🏪 Vendido por: <Text style={styles.storeName}>{product.store.name}</Text>
                            </Text>
                            <Text style={styles.location}>
                                📍 {product.store.neighborhood} - {product.store.city}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.price}>
                        R$ {numericPrice.toFixed(2).replace('.', ',')}
                    </Text>

                    <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>
                            {stockQuantity > 0 ? `Em estoque: ${stockQuantity} un` : 'Fora de estoque'}
                        </Text>
                    </View>

                    {/* Seção Descrição */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descrição</Text>
                        <Text style={styles.description}>
                            {product.description && product.description.trim() !== ''
                                ? product.description
                                : 'Nenhuma descrição cadastrada para este produto.'}
                        </Text>
                    </View>

                    {/* Seleção de Quantidade */}
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityLabel}>Quantidade:</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                            >
                                <Text style={styles.qtyButtonText}>-</Text>
                            </TouchableOpacity>

                            <Text style={styles.qtyValue}>{quantity}</Text>

                            <TouchableOpacity
                                style={styles.qtyButton}
                                onPress={() =>
                                    setQuantity((prev) =>
                                        Math.min(stockQuantity > 0 ? stockQuantity : 99, prev + 1)
                                    )
                                }
                            >
                                <Text style={styles.qtyButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Botão Fixo de Compra */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Adicionar ao Carrinho</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110,
    },
    backButton: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    backButtonText: {
        color: '#FF6B00',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    storeTag: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    storeName: {
        color: '#FF6B00',
        fontWeight: 'bold',
    },
    location: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
        marginBottom: 16,
    },
    price: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2B8A3E',
        marginBottom: 8,
    },
    stockBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E6FCF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 20,
    },
    stockText: {
        color: '#0CA678',
        fontSize: 13,
        fontWeight: '600',
    },
    section: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
        paddingTop: 16,
    },
    quantityLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 16,
        color: '#333',
    },
    footer: {
        backgroundColor: '#FFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    addToCartButton: {
        backgroundColor: '#FF6B00',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
})