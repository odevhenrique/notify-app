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
  Modal,
  Alert,
} from "react-native";
import { login, esqueceuSenha, redefinirSenha } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { setLogado } = useAuth();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Modal recuperação de senha
  const [modalAberto, setModalAberto] = useState(false);
  const [passo, setPasso] = useState(1);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [erroModal, setErroModal] = useState("");

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

  function abrirModal() {
    setEmailRecuperacao("");
    setCodigo("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErroModal("");
    setPasso(1);
    setModalAberto(true);
  }

  async function handleEnviarCodigo() {
    if (!emailRecuperacao) {
      setErroModal("Digite seu email.");
      return;
    }
    setLoadingModal(true);
    setErroModal("");
    try {
      await esqueceuSenha(emailRecuperacao);
      setPasso(2);
    } catch (error) {
      setErroModal(error.message || "Erro ao enviar código");
    } finally {
      setLoadingModal(false);
    }
  }

  async function handleRedefinirSenha() {
    if (!codigo || !novaSenha || !confirmarSenha) {
      setErroModal("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroModal("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroModal("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoadingModal(true);
    setErroModal("");
    try {
      await redefinirSenha(emailRecuperacao, codigo, novaSenha);
      setModalAberto(false);
      Alert.alert("Senha redefinida!", "Faça login com sua nova senha.");
    } catch (error) {
      setErroModal(error.message || "Erro ao redefinir senha");
    } finally {
      setLoadingModal(false);
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
          <Text style={styles.appName}>Notify Home</Text>
          <Text style={styles.appSub}>Controle de despesas domésticas</Text>
        </View>

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

          <TouchableOpacity style={styles.btnLink} onPress={abrirModal}>
            <Text style={styles.btnLinkText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Recuperação de Senha */}
      <Modal
        visible={modalAberto}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAberto(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {passo === 1 ? "Esqueci minha senha" : "Redefinir senha"}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <Text style={styles.fechar}>✕</Text>
              </TouchableOpacity>
            </View>

            {passo === 1 ? (
              <>
                <Text style={styles.modalDica}>
                  Digite seu email e enviaremos um código de 6 dígitos para redefinir sua senha.
                </Text>

                <Text style={styles.inputLabel}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailRecuperacao}
                  onChangeText={setEmailRecuperacao}
                />

                {erroModal ? <Text style={styles.erro}>{erroModal}</Text> : null}

                <TouchableOpacity
                  style={[styles.btnPrimary, loadingModal && styles.btnDesativado]}
                  onPress={handleEnviarCodigo}
                  disabled={loadingModal}
                >
                  <Text style={styles.btnPrimaryText}>
                    {loadingModal ? "Enviando..." : "Enviar código"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalDica}>
                  Código enviado para {emailRecuperacao}. Verifique sua caixa de entrada.
                </Text>

                <Text style={styles.inputLabel}>Código (6 dígitos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                />

                <Text style={styles.inputLabel}>Nova senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                />

                <Text style={styles.inputLabel}>Confirmar nova senha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repita a nova senha"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                />

                {erroModal ? <Text style={styles.erro}>{erroModal}</Text> : null}

                <TouchableOpacity
                  style={[styles.btnPrimary, loadingModal && styles.btnDesativado]}
                  onPress={handleRedefinirSenha}
                  disabled={loadingModal}
                >
                  <Text style={styles.btnPrimaryText}>
                    {loadingModal ? "Redefinindo..." : "Redefinir senha"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnLink} onPress={() => setPasso(1)}>
                  <Text style={styles.btnLinkText}>Reenviar código</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  fechar: {
    fontSize: 18,
    color: "#888",
    paddingHorizontal: 4,
  },
  modalDica: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    marginTop: 10,
  },
});
