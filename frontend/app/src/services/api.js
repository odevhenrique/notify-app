import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://notify-app-yqfh.onrender.com'

// Token
async function getToken() {
    return await AsyncStorage.getItem('token')
}

// Login
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

// Criar uma conta a pagar
export async function criarDespesa(title, amount, due_date) {
    const token = await getToken()

    const response = await fetch(`${BASE_URL}/expenses/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            title,
            amount,
            due_date
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao criar conta a pagar')
    }

    return data
}

// Listar Contas
export async function getDespesas(){
    const token = await getToken()

    const response = await fetch(`${BASE_URL}/expenses/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar despensas')
    }

    return data
}

// Marcar conta como paga
export async function pagarDespesa(id) {
    const token = await getToken()

    const response = await fetch(`${BASE_URL}/expenses/${id}/pay`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Erro ao marcar despesa como paga')
    }

    return data
}

// Excluir uma conta
export async function deletarDespesa(id) {
    const token = await getToken()

    const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Erro ao excluir despesa')
    }

    return true
}

export async function acordarApi() {
  try {
    await fetch(`${BASE_URL}/health`, { method: 'GET' });
  } catch {
    // silencioso — só acorda a API
  }
}