import { useState } from "react";
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
import { cadastrar } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CadastroScreen({ navigation }) {
  const { setLogado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function handleCadastro() {
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      await cadastrar(nome, email, senha);
      setLogado(true);
    } catch (error) {
      setErro(error.message || "Erro ao criar conta");
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
        <View style={styles.logoArea}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Criar conta</Text>
          <Text style={styles.appSub}>Comece a organizar suas despesas</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#A0A0A0"
            value={nome}
            onChangeText={setNome}
          />

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
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDesativado]}
            onPress={handleCadastro}
            disabled={loading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLink} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.btnLinkText}>Já tenho uma conta</Text>
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
