import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [logado, setLogado] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function verificarToken() {
            const token = await AsyncStorage.getItem('token')
            setLogado(!!token)
            setLoading(false)
        }
        verificarToken()
    },[])

    async function logout() {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('email')
        setLogado(false)
    }

    return (
        <AuthContext.Provider value={{ logado, setLogado, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}