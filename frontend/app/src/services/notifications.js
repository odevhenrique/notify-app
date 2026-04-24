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

export async function agendarNotificacaoDespesa(despesa) {
    const permissao = await pedirPermissao()
    if (!permissao) return

    const diasAntes = parseInt(await AsyncStorage.getItem('notif_dias') || '2')
    const horario = await AsyncStorage.getItem('notif_horario') || '08:00'
    const [hora, minuto] = horario.split(':').map(Number)

    const vencimento = new Date(despesa.due_data)
    const dataNotificacao = new Date(vencimento)
    dataNotificacao.setDate(dataNotificacao.getDate() - diasAntes)
    dataNotificacao.setHours(hora, minuto, 0, 0)

    if (dataNotificacao <= new Date()) return

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Despesa próxima do vencimento!',
            body: `${despesa.title} vence em ${diasAntes} dia(s). Valor: ${Number(despesa.amount).toFixed(2)}`,
            data: { despesaId: despesa.id },
        },
        trigger: {
            type: 'date',
            date: dataNotificacao,
        }
    })
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