import { useEffect, useState } from "react";
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import NovaDespesaScreen from "../screens/NovaDespesaScreen"
import PerfilScreen from "../screens/PerfilScreen";
import ConfiguracoesNotificacaoScreen from "../screens/ConfiguracoesNotificacaoScreen";

const Stack = createNativeStackNavigator()

export default function AppNavigator(){
    const { logado, loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large"color="#1d9375"/>
            </View>
        )
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {logado ? (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="NovaDespesa" component={NovaDespesaScreen} />
                        <Stack.Screen name="ConfiguracoesNotificacao" component={ConfiguracoesNotificacaoScreen} />
                        <Stack.Screen name="Perfil" component={PerfilScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen}/>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    )
}