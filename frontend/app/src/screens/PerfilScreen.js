import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { testarNotificacao } from "../services/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { alterarSenha, criarUsuario } from "../services/api";

export default function PerfilScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState("");
  const [modalCriarUser, setModalCriarUser] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenhaUser, setNovaSenhaUser] = useState("");
  const [loadingCriarUser, setLoadingCriarUser] = useState(false);
  const [erroCriarUser, setErroCriarUser] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    async function carregarDados() {
      const e = await AsyncStorage.getItem("email");
      if (e) setEmail(e);
      const admin = await AsyncStorage.getItem("is_admin");
      setIsAdmin(admin === "true");
    }
    carregarDados();
  }, []);

  async function handleLogout() {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  function abrirModalSenha() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErroSenha("");
    setModalSenha(true);
  }

  async function handleAlterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As novas senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroSenha("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoadingSenha(true);
    setErroSenha("");
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setModalSenha(false);
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
    } catch (error) {
      setErroSenha(error.message || "Erro ao alterar senha.");
    } finally {
      setLoadingSenha(false);
    }
  }

  function abrirModalCriarUser() {
    setNovoNome("");
    setNovoEmail("");
    setNovaSenhaUser("");
    setErroCriarUser("");
    setModalCriarUser(true);
  }

  async function handleCriarUsuario() {
    if (!novoNome || !novoEmail || !novaSenhaUser) {
      setErroCriarUser("Preencha todos os campos.");
      return;
    }
    if (novaSenhaUser.length < 6) {
      setErroCriarUser("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoadingCriarUser(true);
    setErroCriarUser("");
    try {
      await criarUsuario(novoNome, novoEmail, novaSenhaUser);
      setModalCriarUser(false);
      Alert.alert("Usuário criado!", `${novoEmail} já pode fazer login.`);
    } catch (error) {
      setErroCriarUser(error.message || "Erro ao criar usuário.");
    } finally {
      setLoadingCriarUser(false);
    }
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
              <Ionicons name="notifications-outline" size={18} color="#854F0B" />
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
                "Feche o app e aguarde 10 segundos — a notificação vai aparecer!"
              );
            } catch (error) {
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

        <TouchableOpacity style={styles.menuItem} onPress={abrirModalSenha}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcone, { backgroundColor: "#EBF4FE" }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#1A5FAD" />
            </View>
            <Text style={styles.menuLabel}>Alterar senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

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

        {isAdmin && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Administração</Text>

            <TouchableOpacity style={styles.menuItem} onPress={abrirModalCriarUser}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcone, { backgroundColor: "#EBF4FE" }]}>
                  <Ionicons name="person-add-outline" size={18} color="#185FA5" />
                </View>
                <Text style={styles.menuLabel}>Criar usuário</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#888" />
            </TouchableOpacity>
          </>
        )}
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

      {/* Modal Criar Usuário */}
      <Modal
        visible={modalCriarUser}
        transparent
        animationType="slide"
        onRequestClose={() => setModalCriarUser(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Criar usuário</Text>
              <TouchableOpacity onPress={() => setModalCriarUser(false)}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDica}>
              O usuário poderá fazer login imediatamente com o email e senha definidos aqui.
            </Text>

            <Text style={styles.inputLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do usuário"
              placeholderTextColor="#A0A0A0"
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={novoEmail}
              onChangeText={setNovoEmail}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={novaSenhaUser}
              onChangeText={setNovaSenhaUser}
            />

            {erroCriarUser ? (
              <Text style={styles.erroTexto}>{erroCriarUser}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.btnSalvar, loadingCriarUser && styles.btnDesativado]}
              onPress={handleCriarUsuario}
              disabled={loadingCriarUser}
            >
              <Text style={styles.btnSalvarTexto}>
                {loadingCriarUser ? "Criando..." : "Criar usuário"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => setModalCriarUser(false)}
            >
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Alterar Senha */}
      <Modal
        visible={modalSenha}
        transparent
        animationType="slide"
        onRequestClose={() => setModalSenha(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Alterar Senha</Text>
              <TouchableOpacity onPress={() => setModalSenha(false)}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDica}>
              Sua senha inicial foi enviada por email no primeiro acesso.
            </Text>

            <Text style={styles.inputLabel}>Senha atual</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
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

            {erroSenha ? (
              <Text style={styles.erroTexto}>{erroSenha}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.btnSalvar, loadingSenha && styles.btnDesativado]}
              onPress={handleAlterarSenha}
              disabled={loadingSenha}
            >
              <Text style={styles.btnSalvarTexto}>
                {loadingSenha ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => setModalSenha(false)}
            >
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    paddingBottom: 36,
    marginHorizontal: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitulo: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  modalDica: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#F5F5F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: { fontSize: 13, color: "#555", marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: "#F5F5F0",
    borderWidth: 0.5,
    borderColor: "#D0D0D0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A1A",
  },
  erroTexto: {
    color: "#A32D2D",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },
  btnSalvar: {
    backgroundColor: "#1D9E75",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  btnSalvarTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
  btnCancelar: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
  },
  btnCancelarTexto: { color: "#888", fontSize: 14 },
  btnDesativado: { backgroundColor: "#A8D5C4" },
});
