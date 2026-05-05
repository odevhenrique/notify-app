import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDespesas, deletarDespesa, getComprovante } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function ArquivadosScreen({ navigation }) {
  const { logout } = useAuth();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [carregandoComprovante, setCarregandoComprovante] = useState(false);

  async function carregarDespesas() {
    try {
      const data = await getDespesas();
      // Filtra apenas as pagas (arquivadas)
      const pagas = data.filter((d) => d.is_paid);
      // Ordena pela data de pagamento mais recente
      pagas.sort((a, b) => {
        const dataA = a.payment_date || a.due_date;
        const dataB = b.payment_date || b.due_date;
        return new Date(dataB) - new Date(dataA);
      });
      setDespesas(pagas);
    } catch (error) {
      if (error.message === "SESSAO_EXPIRADA") {
        await logout();
        return;
      }
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDespesas();
  }, []);

  // Extrai os meses disponíveis nas despesas pagas
  function mesesDisponiveis() {
    const mesesSet = new Set();
    despesas.forEach((d) => {
      const data = d.payment_date || d.due_date;
      const mes = new Date(data).getMonth();
      mesesSet.add(mes);
    });
    return Array.from(mesesSet).sort((a, b) => b - a);
  }

  function despesasFiltradas() {
    let resultado = despesas;

    if (busca.trim()) {
      resultado = resultado.filter((d) =>
        d.title.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (mesSelecionado !== null) {
      resultado = resultado.filter((d) => {
        const data = d.payment_date || d.due_date;
        return new Date(data).getMonth() === mesSelecionado;
      });
    }

    return resultado;
  }

  function totalArquivado() {
    return despesasFiltradas()
      .reduce((acc, d) => acc + d.amount, 0)
      .toFixed(2);
  }

  function formatarData(dateStr) {
    if (!dateStr) return "—";
    const [ano, mes, dia] = dateStr.split("T")[0].split("-");
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  }

  async function handleAbrirModal(item) {
    setDespesaSelecionada(item);
    setComprovante(null);
    setModalVisivel(true);
    setCarregandoComprovante(true);

    try {
      const data = await getComprovante(item.id);
      setComprovante(data.url);
    } catch {
      // sem comprovante
    } finally {
      setCarregandoComprovante(false);
    }
  }

  async function handleDeletar(id) {
    Alert.alert(
      "Excluir despesa",
      "Deseja remover esta despesa dos arquivados? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletarDespesa(id);
              setModalVisivel(false);
              carregarDespesas();
            } catch (error) {
              Alert.alert("Erro", error.message);
            }
          },
        },
      ]
    );
  }

  function renderDespesa({ item }) {
    const dataPagamento = item.payment_date
      ? formatarData(item.payment_date)
      : formatarData(item.due_date);
    const temComprovante = !!item.receipt_url;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleAbrirModal(item)}
        activeOpacity={0.75}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardIcone}>
            <Ionicons name="checkmark-circle" size={22} color="#1D9E75" />
          </View>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitulo} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardMeta}>Pago em {dataPagamento}</Text>
            {temComprovante && (
              <View style={styles.badgeComprovante}>
                <Ionicons name="attach-outline" size={11} color="#1d6e53" />
                <Text style={styles.badgeComprovanteTexto}>Com comprovante</Text>
              </View>
            )}
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardValor}>
              R$ {Number(item.amount).toFixed(2)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" style={{ marginTop: 6 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const meses = mesesDisponiveis();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTexto}>
          <Text style={styles.headerTitle}>Arquivados</Text>
          <Text style={styles.headerSub}>Despesas pagas com comprovante</Text>
        </View>
      </View>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons name="search-outline" size={18} color="#aaa" style={styles.buscaIcone} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar despesa..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca("")}>
            <Ionicons name="close-circle" size={18} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtro por mês */}
      {meses.length > 0 && (
        <View style={styles.mesesScroll}>
          <TouchableOpacity
            style={[styles.mesBotao, mesSelecionado === null && styles.mesAtivo]}
            onPress={() => setMesSelecionado(null)}
          >
            <Text style={[styles.mesTexto, mesSelecionado === null && styles.mesTextoAtivo]}>
              Todos
            </Text>
          </TouchableOpacity>
          {meses.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.mesBotao, mesSelecionado === m && styles.mesAtivo]}
              onPress={() => setMesSelecionado(mesSelecionado === m ? null : m)}
            >
              <Text style={[styles.mesTexto, mesSelecionado === m && styles.mesTextoAtivo]}>
                {MESES[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Resumo */}
      {!loading && (
        <View style={styles.resumo}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>
              {despesasFiltradas().length} despesa{despesasFiltradas().length !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.resumoValor}>R$ {totalArquivado()}</Text>
          </View>
          <Text style={styles.resumoSub}>total arquivado</Text>
        </View>
      )}

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={despesasFiltradas()}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDespesa}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1D9E75"]} />
          }
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <Ionicons name="archive-outline" size={52} color="#ddd" />
              <Text style={styles.vazioTitulo}>Nenhuma despesa arquivada</Text>
              <Text style={styles.vazioSub}>
                {busca || mesSelecionado !== null
                  ? "Tente ajustar os filtros"
                  : "As despesas pagas aparecerão aqui"}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal Detalhes + Comprovante */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo} numberOfLines={2}>
                {despesaSelecionada?.title}
              </Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            {/* Valor e datas */}
            <Text style={styles.modalValor}>
              R$ {Number(despesaSelecionada?.amount || 0).toFixed(2)}
            </Text>

            <View style={styles.modalInfoRow}>
              <View style={styles.modalInfoItem}>
                <Ionicons name="calendar-outline" size={14} color="#888" />
                <Text style={styles.modalInfoLabel}>Vencimento</Text>
                <Text style={styles.modalInfoValor}>
                  {formatarData(despesaSelecionada?.due_date)}
                </Text>
              </View>
              {despesaSelecionada?.payment_date && (
                <View style={styles.modalInfoItem}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#1D9E75" />
                  <Text style={styles.modalInfoLabel}>Pago em</Text>
                  <Text style={[styles.modalInfoValor, { color: "#1D9E75" }]}>
                    {formatarData(despesaSelecionada?.payment_date)}
                  </Text>
                </View>
              )}
            </View>

            {/* Comprovante */}
            <Text style={styles.secaoTitulo}>Comprovante</Text>

            {carregandoComprovante ? (
              <View style={styles.semComprovante}>
                <ActivityIndicator size="small" color="#1D9E75" />
                <Text style={styles.semComprovanteTexto}>Carregando...</Text>
              </View>
            ) : comprovante ? (
              <View style={styles.comprovanteContainer}>
                <Image
                  source={{ uri: comprovante }}
                  style={styles.comprovanteImagem}
                  resizeMode="contain"
                />
                <View style={styles.comprovanteBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#1d9e75" />
                  <Text style={styles.comprovanteBadgeTexto}>Comprovante verificado</Text>
                </View>
              </View>
            ) : (
              <View style={styles.semComprovante}>
                <Ionicons name="document-outline" size={44} color="#ddd" />
                <Text style={styles.semComprovanteTexto}>Nenhum comprovante anexado</Text>
              </View>
            )}

            {/* Botão excluir */}
            <TouchableOpacity
              style={styles.btnExcluir}
              onPress={() => handleDeletar(despesaSelecionada?.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#a32d2d" />
              <Text style={styles.btnExcluirTexto}>Excluir despesa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Ionicons name="home-outline" size={22} color="#888" />
          <Text style={styles.navTexto}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="archive" size={22} color="#1D9E75" />
          <Text style={[styles.navTexto, { color: "#1D9E75" }]}>Arquivados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Ionicons name="person-outline" size={22} color="#888" />
          <Text style={styles.navTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    backgroundColor: "#1d9e75",
    padding: 20,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBack: {
    padding: 4,
  },
  headerTexto: {
    flex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  headerSub: { fontSize: 12, color: "#9FE1CB", marginTop: 2 },

  // Busca
  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  buscaIcone: {},
  buscaInput: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
    padding: 0,
  },

  // Filtro meses
  mesesScroll: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: "wrap",
  },
  mesBotao: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  mesAtivo: { backgroundColor: "#1D9E75", borderColor: "#1D9E75" },
  mesTexto: { fontSize: 12, color: "#888" },
  mesTextoAtivo: { color: "#fff", fontWeight: "500" },

  // Resumo
  resumo: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumoItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  resumoLabel: { fontSize: 13, color: "#888" },
  resumoValor: { fontSize: 17, fontWeight: "700", color: "#1D9E75" },
  resumoSub: { fontSize: 11, color: "#bbb" },

  // Lista
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eaf3de",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLeft: { flex: 1 },
  cardTitulo: { fontSize: 15, fontWeight: "500", color: "#1A1A1A" },
  cardMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  badgeComprovante: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#eaf3de",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeComprovanteTexto: { fontSize: 10, color: "#1d6e53", fontWeight: "500" },
  cardRight: { alignItems: "flex-end" },
  cardValor: { fontSize: 15, fontWeight: "600", color: "#1A1A1A" },

  // Vazio
  vazioContainer: { alignItems: "center", paddingVertical: 60, gap: 8 },
  vazioTitulo: { fontSize: 15, fontWeight: "500", color: "#aaa", marginTop: 8 },
  vazioSub: { fontSize: 13, color: "#ccc", textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  modalValor: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1d9e75",
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  modalInfoItem: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    borderRadius: 10,
    padding: 10,
    gap: 3,
  },
  modalInfoLabel: { fontSize: 11, color: "#aaa" },
  modalInfoValor: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  comprovanteContainer: { marginBottom: 16, alignItems: "center" },
  comprovanteImagem: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  comprovanteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "#eaf3de",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  comprovanteBadgeTexto: { fontSize: 12, color: "#1d6e53", fontWeight: "500" },
  semComprovante: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    marginBottom: 16,
  },
  semComprovanteTexto: { fontSize: 13, color: "#bbb" },
  btnExcluir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f5d0d0",
    backgroundColor: "#fff8f8",
    marginTop: 4,
  },
  btnExcluirTexto: { fontSize: 14, color: "#a32d2d", fontWeight: "500" },

  // Bottom Nav
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