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

interface CreateStoreProps {
  onSuccess: () => void
}

export function CreateStore({ onSuccess }: CreateStoreProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [document, setDocument] = useState('')
  const [phone, setPhone] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState('')
  const [number, setNumber] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [loading, setLoading] = useState(false)

  // Função para gerar o slug automaticamente a partir do nome da loja
  function handleNameChange(text: string) {
    setName(text)
    const generatedSlug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generatedSlug)
  }

  async function handleCreateStore() {
    const cleanDocument = document.replace(/\D/g, '')
    const cleanZipCode = zipCode.replace(/\D/g, '')
    const cleanPhone = phone.replace(/\D/g, '')

    if (
      !name.trim() ||
      !slug.trim() ||
      !cleanDocument ||
      !cleanPhone ||
      !pixKey.trim() ||
      !address.trim() ||
      !number.trim() ||
      !neighborhood.trim() ||
      !city.trim() ||
      !state.trim() ||
      !cleanZipCode
    ) {
      return Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (*).')
    }

    if (cleanDocument.length < 11) {
      return Alert.alert('Documento Inválido', 'Informe um CPF ou CNPJ válido.')
    }

    if (state.trim().length !== 2) {
      return Alert.alert('Estado Inválido', 'O Estado (UF) deve ter exatamente 2 letras (Ex: RJ).')
    }

    try {
      setLoading(true)

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        document: cleanDocument,
        phone: cleanPhone,
        pixKey: pixKey.trim(),
        address: address.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        zipCode: cleanZipCode,
      }

      await api.post('/stores', payload)

      Alert.alert('Sucesso! 🎉', 'Sua loja foi criada com sucesso.', [
        { text: 'OK', onPress: onSuccess },
      ])
    } catch (error: any) {
      console.log('--- ERRO DETALHADO DA API ---')
      console.log(JSON.stringify(error.response?.data, null, 2))

      const responseData = error.response?.data
      let errorMessage = 'Não foi possível cadastrar a loja.'

      if (responseData?.message) {
        errorMessage = responseData.message
      }

      Alert.alert('Erro no Cadastro', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Abrir Minha Loja 🏪</Text>
      <Text style={styles.subtitle}>
        Cadastre os dados do seu negócio para começar a vender no OLIAKI.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome da Loja *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: PL Domus"
          placeholderTextColor="#999"
          value={name}
          onChangeText={handleNameChange}
        />

        <Text style={styles.label}>Link Único / Slug *</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: pl-domus"
          placeholderTextColor="#999"
          autoCapitalize="none"
          value={slug}
          onChangeText={setSlug}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte um pouco sobre sua loja e produtos..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>CPF ou CNPJ *</Text>
        <TextInput
          style={styles.input}
          placeholder="Apenas números (11 ou 14 dígitos)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={document}
          onChangeText={setDocument}
        />

        <Text style={styles.label}>Telefone / WhatsApp *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 21969349333"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Chave PIX (para receber vendas) *</Text>
        <TextInput
          style={styles.input}
          placeholder="CPF, E-mail, Celular ou Chave Aleatória"
          placeholderTextColor="#999"
          autoCapitalize="none"
          value={pixKey}
          onChangeText={setPixKey}
        />

        <Text style={styles.label}>CEP *</Text>
        <TextInput
          style={styles.input}
          placeholder="25900000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={zipCode}
          onChangeText={setZipCode}
        />

        <Text style={styles.label}>Endereço (Rua / Avenida) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Rua Alberto Torres"
          placeholderTextColor="#999"
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Número *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              placeholderTextColor="#999"
              value={number}
              onChangeText={setNumber}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Estado (UF) *</Text>
            <TextInput
              style={styles.input}
              placeholder="RJ"
              placeholderTextColor="#999"
              maxLength={2}
              autoCapitalize="characters"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>

        <Text style={styles.label}>Bairro *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Tijuca"
          placeholderTextColor="#999"
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <Text style={styles.label}>Cidade *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Teresópolis"
          placeholderTextColor="#999"
          value={city}
          onChangeText={setCity}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateStore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar Loja</Text>
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
    fontSize: 26,
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
    marginBottom: 40,
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