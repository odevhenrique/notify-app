import { Platform, Alert as RNAlert } from "react-native";

// RNAlert.alert é um no-op no react-native-web, então nenhuma mensagem
// aparece quando o app roda no navegador. Este wrapper usa
// window.alert/window.confirm nesse caso, mantendo a mesma assinatura
// (title, message, buttons) usada em todo o app.
function alert(title, message, buttons) {
  if (Platform.OS !== "web") {
    return RNAlert.alert(title, message, buttons);
  }

  const texto = [title, message].filter(Boolean).join("\n\n");

  if (!buttons || buttons.length === 0) {
    window.alert(texto);
    return;
  }

  if (buttons.length === 1) {
    window.alert(texto);
    buttons[0].onPress?.();
    return;
  }

  const cancelButton = buttons.find((b) => b.style === "cancel");
  const confirmButton = buttons.find((b) => b !== cancelButton) || buttons[buttons.length - 1];

  if (window.confirm(texto)) {
    confirmButton.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}

export default { alert };
