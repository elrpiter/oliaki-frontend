import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { api } from '../services/api'

function showAlert(title: string, message: string, onPressOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`)
    if (onPressOk) onPressOk()
  } else {
    // Para Mobile
    const { Alert } = require('react-native')
    Alert.alert(title, message, [{ text: 'OK', onPress: onPressOk }])
  }
}

export function SignUp() {
  const navigation = useNavigation<any>()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSignUp() {
    setErrorMessage('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (*).')
      return
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    try {
      setLoading(true)

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role: 'BUYER', // Padrão comprador
      }

      console.log('🚀 Enviando cadastro para /users:', payload)

      await api.post('/users', payload)

      showAlert(
        'Conta Criada! 🎉',
        'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
        () => {
          navigation.navigate('SignIn')
        }
      )
    } catch (error: any) {
      console.log('--- ERRO NO CADASTRO ---', error.response?.data || error.message)
      
      const responseData = error.response?.data
      let message = 'Não foi possível criar a conta. Tente novamente.'

      if (responseData?.message) {
        message = responseData.message
      } else if (responseData?.errors) {
        message = 'Dados inválidos. Verifique se o e-mail já não está cadastrado.'
      }

      setErrorMessage(message)
      showAlert('Erro no Cadastro', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta 🚀</Text>
        <Text style={styles.subtitle}>Junte-se ao marketplace local</Text>

        <View style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail *</Text>
          <TextInput
            style={styles.input}
            placeholder="seu.email@exemplo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Telefone / WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="(21) 99999-9999"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Senha * (mínimo 6 caracteres)</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua senha secreta"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.linkText}> Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFC9C9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#E03131',
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: 'bold',
  },
})