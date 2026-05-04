import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { testarNotificacao } from "../services/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

export default function PerfilScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const { logout } = useAuth()

  useEffect(() => {
    async function carregarEmail() {
      const e = await AsyncStorage.getItem("email");
      if (e) setEmail(e);
    }
    carregarEmail();
  }, []);

  async function handleLogout() {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout()
        },
      },
    ]);
  }

  const iniciais = email ? email.slice(0, 2).toUpperCase() : "?";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciais}</Text>
        </View>
        <Text style={styles.email}>{email || "Usuário"}</Text>
      </View>

      {/* Menu */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ConfiguracoesNotificacao")}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcone, { backgroundColor: "#FAEEDA" }]}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#854F0B"
              />
            </View>
            <Text style={styles.menuLabel}>Notificações</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={async () => {
            try {
              await testarNotificacao();
              Alert.alert(
                "✅ Agendado!",
                "Feche o app e aguarde 10 segundos — a notificação vai aparecer!",
              );
            } catch (error) {
              console.log("Erro:", error.message);
              Alert.alert("Erro", error.message);
            }
          }}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcone, { backgroundColor: "#E6F1FB" }]}>
              <Ionicons name="flask-outline" size={18} color="#185FA5" />
            </View>
            <Text style={styles.menuLabel}>Testar notificação</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Conta</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcone, { backgroundColor: "#FCEBEB" }]}>
              <Ionicons name="log-out-outline" size={18} color="#A32D2D" />
            </View>
            <Text style={[styles.menuLabel, { color: "#A32D2D" }]}>
              Sair da conta
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A32D2D" />
        </TouchableOpacity>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Ionicons name="home-outline" size={22} color="#888" />
          <Text style={styles.navTexto}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Arquivados")}
        >
          <Ionicons name="archive-outline" size={22} color="#888" />
          <Text style={styles.navTexto}>Arquivados</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color="#1D9E75" />
          <Text style={[styles.navTexto, { color: "#1D9E75" }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  header: {
    backgroundColor: "#1D9E75",
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarTexto: { fontSize: 24, fontWeight: "600", color: "#fff" },
  email: { fontSize: 14, color: "#9FE1CB" },
  content: { padding: 20, flex: 1 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
    textTransform: "uppercase",
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcone: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, color: "#1A1A1A" },
  divider: { height: 0.5, backgroundColor: "#E0E0E0", marginVertical: 12 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
    paddingVertical: 10,
    paddingBottom: 50,
  },
  navItem: { alignItems: "center", gap: 2 },
  navTexto: { fontSize: 10, color: "#888" },
});
