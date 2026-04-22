import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://notify-app-yqfh.onrender.com'

export async function login(email, senha) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', senha)

    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
        const detail = data.detail
        if (Array.isArray(detail)) {
            throw new Error(detail.map(d => d.msg).join(', '))
        }
        throw new Error(detail || 'Erro ao fazer login')
    }

    await AsyncStorage.setItem('token', data.access_token)

    return data
}