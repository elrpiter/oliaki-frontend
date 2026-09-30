import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SignIn } from '../screens/SignIn'
import { SignUp } from '../screens/SignUp'

export type AuthStackParamList = {
  SignIn: undefined
  SignUp: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreenWrapper} />
      <Stack.Screen name="SignUp" component={SignUpScreenWrapper} />
    </Stack.Navigator>
  )
}

// Wrapper para manter compatibilidade com as telas criadas anteriormente
function SignInScreenWrapper({ navigation }: any) {
  return (
    <SignIn
      onSignInSuccess={() => {}}
      onNavigateToSignUp={() => navigation.navigate('SignUp')}
    />
  )
}

function SignUpScreenWrapper({ navigation }: any) {
  return (
    <SignUp onNavigateToSignIn={() => navigation.navigate('SignIn')} />
  )
}