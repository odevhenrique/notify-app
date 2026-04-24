import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { criarDespesa } from '../services/api';
import { agendarNotificacaoDespesa } from '../services/notifications';

export default function NovaDespesaScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  function formatarData(texto) {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }

  function converterData(data) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  async function handleSalvar() {
    if (!title || !amount || !dueDate) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (dueDate.length < 10) {
      Alert.alert('Atenção', 'Data inválida. Use o formato DD/MM/AAAA.');
      return;
    }

    setLoading(true);
    try {
      const despesa = await criarDespesa(title, parseFloat(amount.replace(',', '.')), converterData(dueDate));
      await agendarNotificacaoDespesa(despesa)
      route.params?.onSave?.();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nova Despesa</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Aluguel, Energia elétrica..."
              placeholderTextColor="#A0A0A0"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor="#A0A0A0"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Data de vencimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              maxLength={10}
              value={dueDate}
              onChangeText={texto => setDueDate(formatarData(texto))}
            />

            <TouchableOpacity
              style={[styles.btnSalvar, loading && styles.btnDesativado]}
              onPress={handleSalvar}
              disabled={loading}
            >
              <Text style={styles.btnSalvarTexto}>
                {loading ? 'Salvando...' : 'Salvar despesa'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: { padding: 20, gap: 8 },
  label: { fontSize: 13, color: '#555', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  btnSalvar: {
    backgroundColor: '#1D9E75',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDesativado: { backgroundColor: '#A8D5C4' },
  btnSalvarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
});