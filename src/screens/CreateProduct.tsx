import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { api } from '../services/api'

interface CreateProductProps {
  storeId: string
  onSuccess: () => void
}

// Função auxiliar para gerar slug amigável (ex: "Teclado RGB!" -> "teclado-rgb")
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-') // Remove hífens duplicados
}

export function CreateProduct({ storeId, onSuccess }: CreateProductProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('1')
  const [loading, setLoading] = useState(false)

  async function handleCreateProduct() {
    if (!title.trim() || !price.trim() || !stock.trim()) {
      return Alert.alert('Atenção', 'Preencha o nome, preço e estoque do produto.')
    }

    if (title.trim().length < 3) {
      return Alert.alert('Atenção', 'O nome do produto deve ter no mínimo 3 caracteres.')
    }

    const numericPrice = parseFloat(price.replace(',', '.'))
    const numericStock = parseInt(stock, 10)

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return Alert.alert('Preço Inválido', 'Informe um valor numérico válido para o preço.')
    }

    if (isNaN(numericStock) || numericStock < 0) {
      return Alert.alert('Estoque Inválido', 'Informe uma quantidade válida para o estoque.')
    }

    const generatedSlug = createSlug(title.trim())

    if (generatedSlug.length < 3) {
      return Alert.alert('Atenção', 'Informe um nome mais completo para gerar o código do produto (slug).')
    }

    try {
      setLoading(true)

      const payload = {
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim() || undefined,
        price: numericPrice,
        stock: numericStock,
      }

      await api.post(`/stores/${storeId}/products`, payload)

      Alert.alert('Sucesso! 🎉', 'Produto cadastrado com sucesso.', [
        { text: 'OK', onPress: onSuccess },
      ])
    } catch (error: any) {
      console.log('Erro ao cadastrar produto:', error.response?.data || error.message)
      const responseData = error.response?.data
      const message = responseData?.message || 'Não foi possível cadastrar o produto.'
      Alert.alert('Erro', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo Produto 📦</Text>
      <Text style={styles.subtitle}>
        Adicione itens ao catálogo da sua loja.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome do Produto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Teclado Mecânico RGB"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Especificações, garantia, marca, etc..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Preço (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 150.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Estoque *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Salvar Produto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})