import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { pedirPermissao } from "./src/services/notifications";
import { acordarApi } from "./src/services/api";

export default function App(){
  useEffect(() => {
    pedirPermissao()
    acordarApi()
  }, [])
  
  return <AppNavigator/>
}