import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { pedirPermissao } from "./src/services/notifications";
import { acordarApi } from "./src/services/api";
import { AuthProvider } from "./src/context/AuthContext";

export default function App(){
  useEffect(() => {
    pedirPermissao()
    acordarApi()
  }, [])
  
  return (
    <AuthProvider>
      <AppNavigator/>
    </AuthProvider>
  ) 
}