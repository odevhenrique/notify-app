import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { pedirPermissao } from "./src/services/notifications";

export default function App(){
  useEffect(() => {
    pedirPermissao()
  }, [])
  
  return <AppNavigator/>
}