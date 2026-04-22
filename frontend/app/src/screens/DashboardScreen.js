import { View, Text, Image, StyleSheet, SafeAreaView } from "react-native";

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo}/>
        <Text style={styles.title}>Bem-vindo ao Notify Home!</Text>
        <Text style={styles.sub}>Seu dashboard está chegando...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  sub: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
});
