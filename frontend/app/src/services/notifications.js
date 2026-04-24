import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    })
})

export async function pedirPermissao() {
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
}

export async function agendarNotificacaoDespesa(despesa, horarioEspecifico = null) {
  const permissao = await pedirPermissao();
  if (!permissao) return;

  let hora, minuto;
  if (horarioEspecifico) {
    [hora, minuto] = horarioEspecifico.split(':').map(Number);
  } else {
    const horarioConfig = await AsyncStorage.getItem('notif_horario') || '08:00';
    [hora, minuto] = horarioConfig.split(':').map(Number);
  }

  const diasAntes = parseInt(await AsyncStorage.getItem('notif_dias') || '2');

  const [ano, mes, dia] = despesa.due_date.split('T')[0].split('-');
  const vencimento = new Date(ano, mes - 1, dia);
  const dataNotificacao = new Date(vencimento);
  dataNotificacao.setDate(dataNotificacao.getDate() - diasAntes);
  dataNotificacao.setHours(hora, minuto, 0, 0);

  if (dataNotificacao <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💰 Despesa próxima do vencimento!',
      body: `${despesa.title} vence em ${diasAntes} dia(s). Valor: R$ ${Number(despesa.amount).toFixed(2)}`,
      data: { despesaId: despesa.id },
    },
    trigger: {
      type: 'date',
      date: dataNotificacao,
    },
  });
}

export async function cancelarNotificacaoDespesa(despesaId) {
    const agendadas = await Notifications.getAllScheduledNotificationsAsync()
    for (const notif of agendadas) {
        if (notif.content.data?.despesaId === despesaId) {
            await Notifications.cancelAllScheduledNotificationsAsync(notif.identifier)
        }
    }
}

export async function testarNotificacao() {
  const permissao = await pedirPermissao();
  if (!permissao) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Teste de notificação!',
      body: 'As notificações do Notify Home estão funcionando!',
    },
    trigger: {
      type: 'timeInterval',  
      seconds: 10,
      repeats: false,
    },
  });
}