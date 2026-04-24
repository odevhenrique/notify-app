import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import NovaDespesaScreen from "../screens/NovaDespesaScreen"
import ConfiguracoesNotificacaoScreen from "../screens/ConfiguracoesNotificacaoScreen";
import PerfilScreen from "../screens/PerfilScreen";

const Stack = createNativeStackNavigator()

export default function AppNavigator(){
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="NovaDespesa" component={NovaDespesaScreen} />
                <Stack.Screen name="ConfiguracoesNotificacao" component={ConfiguracoesNotificacaoScreen} />
                <Stack.Screen name="Perfil" component={PerfilScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}