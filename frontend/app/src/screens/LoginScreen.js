import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import { login, loginComGoogle } from "../services/api";
import { useAuth } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export default function LoginScreen({ navigation }) {
  const { setLogado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Expo Go: usa web client com proxy auth.expo.io
  // Produção: usa android client com reverse-client-id URI (padrão Google nativo)
  const authConfig = __DEV__
    ? {
        androidClientId: WEB_CLIENT_ID,
        webClientId: WEB_CLIENT_ID,
        redirectUri: "https://auth.expo.io/@mrpolar777/app",
      }
    : {
        androidClientId: ANDROID_CLIENT_ID,
      };

  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        handleGoogleLogin(accessToken);
      } else {
        setErro("Não foi possível obter token do Google.");
        setGoogleLoading(false);
      }
    } else if (response?.type === "error") {
      setErro("Erro ao autenticar com Google.");
      setGoogleLoading(false);
    } else if (response?.type === "dismiss") {
      setGoogleLoading(false);
    }
  }, [response]);

  async function handleLogin() {
    if (!email || !senha) {
      setErro("Preencha email e senha.");
      return;
    }

    setErro("");
    setLoading(true);

    try {
      await login(email, senha);
      setLogado(true);
    } catch (error) {
      setErro(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(accessToken) {
    setErro("");
    setGoogleLoading(true);
    try {
      await loginComGoogle(accessToken);
      setLogado(true);
    } catch (error) {
      setErro(error.message || "Erro ao fazer login com Google");
    } finally {
      setGoogleLoading(false);
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
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
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

          {/* Separador */}
          <View style={styles.separador}>
            <View style={styles.separadorLinha} />
            <Text style={styles.separadorTexto}>ou</Text>
            <View style={styles.separadorLinha} />
          </View>

          {/* Botão Google */}
          <TouchableOpacity
            style={[styles.btnGoogle, (googleLoading || !request) && styles.btnDesativado]}
            onPress={() => {
              setErro("");
              setGoogleLoading(true);
              promptAsync();
            }}
            disabled={googleLoading || !request}
          >
            <MaterialCommunityIcons name="google" size={20} color="#fff" style={styles.googleIcon} />
            <Text style={styles.btnGoogleText}>
              {googleLoading ? "Aguardando Google..." : "Entrar com Google"}
            </Text>
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
  logo: {
    width: 100,
    height: 100,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
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
  separador: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  separadorLinha: {
    flex: 1,
    height: 1,
    backgroundColor: "#D0D0D0",
  },
  separadorTexto: {
    color: "#888",
    fontSize: 13,
  },
  btnGoogle: {
    backgroundColor: "#4285F4",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  btnGoogleText: {
    color: "#fff",
    fontSize: 15,
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
