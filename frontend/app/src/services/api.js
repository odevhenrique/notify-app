import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export async function login(email, senha) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: senha })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao fazer o login')
    }

    await AsyncStorage.setItem('token', data.access_token)

    return data
}