import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const OPCOES_DIAS = [1, 2, 3, 5, 7];
const OPCOES_HORARIO = ['07:00', '08:00', '09:00', '12:00', '18:00', '20:00'];

export default function ConfiguracoesNotificacaoScreen({ navigation }) {
  const [diasAntes, setDiasAntes] = useState(2);
  const [horario, setHorario] = useState('08:00');

  useEffect(() => {
    async function carregarConfigs() {
      const dias = await AsyncStorage.getItem('notif_dias');
      const hora = await AsyncStorage.getItem('notif_horario');
      if (dias) setDiasAntes(parseInt(dias));
      if (hora) setHorario(hora);
    }
    carregarConfigs();
  }, []);

  async function handleSalvar() {
    await AsyncStorage.setItem('notif_dias', String(diasAntes));
    await AsyncStorage.setItem('notif_horario', horario);
    Alert.alert('Salvo!', 'Configurações de notificação atualizadas.');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Dias de antecedência */}
        <Text style={styles.sectionTitle}>Avisar quantos dias antes?</Text>
        <View style={styles.opcoes}>
          {OPCOES_DIAS.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.opcaoBotao, diasAntes === d && styles.opcaoAtiva]}
              onPress={() => setDiasAntes(d)}
            >
              <Text style={[styles.opcaoTexto, diasAntes === d && styles.opcaoTextoAtivo]}>
                {d} {d === 1 ? 'dia' : 'dias'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horário */}
        <Text style={styles.sectionTitle}>Horário da notificação</Text>
        <View style={styles.opcoes}>
          {OPCOES_HORARIO.map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.opcaoBotao, horario === h && styles.opcaoAtiva]}
              onPress={() => setHorario(h)}
            >
              <Text style={[styles.opcaoTexto, horario === h && styles.opcaoTextoAtivo]}>
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumo */}
        <View style={styles.resumo}>
          <Ionicons name="notifications" size={20} color="#1D9E75" />
          <Text style={styles.resumoTexto}>
            Você será notificado {diasAntes} {diasAntes === 1 ? 'dia' : 'dias'} antes do vencimento às {horario}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
          <Text style={styles.btnSalvarTexto}>Salvar configurações</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  header: {
    backgroundColor: '#1D9E75',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
  },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcaoBotao: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#D0D0D0',
  },
  opcaoAtiva: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  opcaoTexto: { fontSize: 13, color: '#555' },
  opcaoTextoAtivo: { color: '#fff', fontWeight: '500' },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E1F5EE',
    padding: 14,
    borderRadius: 12,
    marginTop: 32,
  },
  resumoTexto: { fontSize: 13, color: '#0F6E56', flex: 1 },
  btnSalvar: {
    backgroundColor: '#1D9E75',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnSalvarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
});