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
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  criarDespesa,
  getDespesas,
  pagarDespesa,
  deletarDespesa,
} from "../services/api";

const FILTROS = ["Todas", "Pendentes", "Pagas", "Atrasadas"];

export default function DashboardScreen({ navigation }) {
  const [despesas, setDespesas] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarDespesas() {
    try {
      const data = await getDespesas();
      setDespesas(data);
    } catch (error) {
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

  function getStatus(despesa) {
    if (despesa.is_paid) return "Paga";
    const hoje = new Date();
    const vencimento = new Date(despesa.due_date);
    if (vencimento < hoje) return "Atrasada";
    return "Pendente";
  }

  function despensasFiltradas() {
    if (filtro === "Todas") return despesas;
    return despesas.filter(
      (d) => getStatus(d) === filtro.slice(0, -1) || getStatus(d) === filtro,
    );
  }

  function totalPendente() {
    return despesas
      .filter((d) => !d.is_paid)
      .reduce((acc, d) => acc + d.amount, 0)
      .toFixed(2);
  }

  function totalPago() {
    return despesas
      .filter((d) => d.is_paid)
      .reduce((acc, d) => acc + d.amount, 0)
      .toFixed(2);
  }

  async function handlePagar(id) {
    console.log('ID da despesa:', id)
    Alert.alert("Confirmar", "Marcar despesa como paga?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            await pagarDespesa(id);
            carregarDespesas();
          } catch (error) {
            Alert.alert("Erro", error.message);
          }
        },
      },
    ]);
  }

  async function handleDeletar(id) {
    Alert.alert("Excluir", "Deseja excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deletarDespesa(id);
            carregarDespesas();
          } catch (error) {
            Alert.alert("Erro", error.message);
          }
        },
      },
    ]);
  }

  function badgeColor(status) {
    if (status === "Paga") return { bg: "#eaf3de", text: "#27500a" };
    if (status === "Atrasada") return { bg: "#fcebeb", text: "#791f1f" };
    return { bg: "#faeeda", text: "#633806" };
  }

  function renderDespesa({ item }) {
    console.log('Despesa:', JSON.stringify(item))
    const status = getStatus(item);
    const cores = badgeColor(status);
    const vencimento = new Date(item.due_date).toLocaleDateString("pt-BR");

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitulo}>{item.title}</Text>
            <Text style={styles.cardMeta}>Vence {vencimento}</Text>
            <View style={[styles.badge, { backgroundColor: cores.bg }]}>
              <Text style={[styles.badgeText, { color: cores.text }]}>
                {status}
              </Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardValor}>
              R$ {Number(item.amount).toFixed(2)}
            </Text>
            <View style={styles.acoes}>
              {!item.is_paid && (
                <TouchableOpacity
                  onPress={() => handlePagar(item.id)}
                  style={styles.btnAcao}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color="#1d9e75"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => handleDeletar(item.id)}
                style={styles.btnAcao}
              >
                <Ionicons name="trash-outline" size={24} color="#a32d2d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notify Home</Text>
          <Text style={styles.headerSub}>Suas despesas do mês</Text>
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.conteudo}>
        {/* Cards resumo */}
        <View style={styles.resumo}>
          <View style={styles.metrica}>
            <Text style={styles.metricaLabel}>Pendentes</Text>
            <Text style={[styles.metricaValor, { color: "#A32D2D" }]}>
              R$ {totalPendente()}
            </Text>
          </View>
          <View style={styles.metrica}>
            <Text style={styles.metricaLabel}>Pagas</Text>
            <Text style={[styles.metricaValor, { color: "#3B6D11" }]}>
              R$ {totalPago()}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtros}>
          {FILTROS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBotao, filtro === f && styles.filtroAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === f && styles.filtroTextoAtivo,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1D9E75"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={despensasFiltradas()}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderDespesa}
            contentContainerStyle={styles.lista}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1D9E75"]}
              />
            }
            ListEmptyComponent={
              <Text style={styles.vazio}>Nenhuma despesa encontrada.</Text>
            }
          />
        )}
      </View>

      {/* Botão Nova Despesa */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("NovaDespesa", { onSave: carregarDespesas })
        }
      >
        <Text style={styles.fabTexto}>+ Nova Despesa</Text>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#1D9E75" />
          <Text style={[styles.navTexto, { color: "#1D9E75" }]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Arquivados")}
        >
          <Ionicons name="archive-outline" size={22} color="#888" />
          <Text style={styles.navTexto}>Arquivados</Text>
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
  conteudo: {
    flex: 1,
  },
  header: {
    backgroundColor: "#1d9e75",
    padding: 20,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  headerSub: { fontSize: 12, color: "#9FE1CB", marginTop: 2 },
  resumo: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  metrica: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  metricaLabel: { fontSize: 12, color: "#888" },
  metricaValor: { fontSize: 18, fontWeight: "600", marginTop: 4 },
  filtros: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filtroBotao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  filtroAtivo: { backgroundColor: "#1D9E75", borderColor: "#1D9E75" },
  filtroTexto: { fontSize: 12, color: "#888" },
  filtroTextoAtivo: { color: "#fff", fontWeight: "500" },
  lista: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  cardLeft: { flex: 1 },
  cardTitulo: { fontSize: 15, fontWeight: "500", color: "#1A1A1A" },
  cardMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "500" },
  cardRight: { alignItems: "flex-end", justifyContent: "space-between" },
  cardValor: { fontSize: 15, fontWeight: "600", color: "#1A1A1A" },
  acoes: { flexDirection: "row", gap: 4, marginTop: 8 },
  btnAcao: { padding: 4 },
  vazio: { textAlign: "center", color: "#888", marginTop: 40, fontSize: 14 },
  bottomNav: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: '#fff',
  borderTopWidth: 0.5,
  borderTopColor: '#E0E0E0',
  paddingVertical: 10,
  paddingBottom: 50,
},
  navItem: { alignItems: "center", gap: 2 },
  navTexto: { fontSize: 10, color: "#888" },
  fab: {
  backgroundColor: '#1D9E75',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 30,
  alignItems: 'center',
  marginHorizontal: 60,
  marginBottom: 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
  fabTexto: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '600',
},
});
