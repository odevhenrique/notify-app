import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { pedirPermissao } from "./src/services/notifications";
import { acordarApi } from "./src/services/api";
import { AuthProvider } from "./src/context/AuthContext";

export default function App(){
  const [apiPronta, setApiPronta] = useState(false)

  useEffect(() => {
    async function inicializar() {
      pedirPermissao()
      await acordarApi()
      setApiPronta(true)
    }
    inicializar()
  }, [])

  if (!apiPronta) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    )
  }

  return (
    <AuthProvider>
      <AppNavigator/>
    </AuthProvider>
  )
}