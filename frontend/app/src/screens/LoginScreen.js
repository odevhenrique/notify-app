import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaViewBase,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../services/api";

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    if (!email || !senha) {
      setErro("Preencha email e senha.");
      return;
    }

    setErro("");
    setLoading(true);

    try {
      await login(email, senha);
      alert("Login efetuado com sucesso!");
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="notifications-circle-sharp"
              size={50}
              color="white"
            />
          </View>
          <Text style={styles.appName}>Notify Home</Text>
          <Text style={styles.appSub}>Controle de despesas domésticas</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDesativado]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink}>
            <Text style={styles.btnLinkText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f0",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1D9E75",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  appName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  appSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#D0D0D0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  btnPrimary: {
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  btnLink: {
    alignItems: "center",
    marginTop: 12,
  },
  btnLinkText: {
    color: "#0F6E56",
    fontSize: 13,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  registerText: {
    fontSize: 13,
    color: "#888",
  },
  registerLink: {
    fontSize: 13,
    color: "#0F6E56",
    fontWeight: "600",
  },
  erro: {
    color: "#A32D2D",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  btnDesativado: {
    backgroundColor: "#A8D5C4",
  },
});
