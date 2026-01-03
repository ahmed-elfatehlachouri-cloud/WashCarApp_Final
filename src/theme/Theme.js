// src/theme/Theme.js
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const scale = (size) => {
  const guidelineBaseWidth = 375;
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH / guidelineBaseWidth) * size);
};

export const Theme = {
  colors: {
    primary: "#0EA5E9",      // Bleu Eau vive (Cyan intense)
    secondary: "#0369A1",    // Bleu Océan (pour les titres)
    accent: "#22D3EE",       // Turquoise clair (Bulles/Savon)
    background: "#F0F9FF",   // Fond de l'eau très clair
    surface: "#FFFFFF",
    textMain: "#0F172A",
    textSub: "#64748B",
    success: "#10B981",
    error: "#F43F5E",
    white: "#FFFFFF",
    border: "#BAE6FD",      // Bordure bleu ciel
  },
  spacing: {
    xs: scale(4), sm: scale(8), md: scale(16), lg: scale(24), xl: scale(32),
  },
  radius: {
    sm: 8, md: 16, lg: 24, full: 99,
  },
  shadow: {
    medium: {
      shadowColor: "#0EA5E9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 5,
    }
  }
};