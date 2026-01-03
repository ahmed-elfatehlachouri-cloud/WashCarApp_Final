import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { scale } from '../../src/theme/Theme';

export default function SplashScreen({ navigation }) {
  const animation = useRef(null);

  useEffect(() => {
    // On attend 4 secondes pour laisser l'animation se jouer
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#BAE6FD', '#FFFFFF']} // Tes couleurs aquatiques
      style={styles.container}
    >
      <View style={styles.content}>
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: scale(280),
            height: scale(280),
          }}
          // NOM EXACT DE TON FICHIER ICI
          source={require('../../assets/animations/Untitled_file.json')}
        />
        <Text style={styles.logoText}>WashCar</Text>
        <Text style={styles.loaderText}>Nettoyage en cours...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoText: { 
    fontSize: scale(42), 
    fontWeight: '900', 
    color: "#0369A1", // Ton bleu océan
    marginTop: scale(10),
    letterSpacing: 2
  },
  loaderText: { 
    fontSize: scale(16), 
    color: "#0EA5E9", 
    marginTop: scale(5),
    fontWeight: '600',
    fontStyle: 'italic'
  }
});