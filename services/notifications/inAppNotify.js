import { Alert, Platform, ToastAndroid } from "react-native";

export function notifyInApp(title, message) {
  if (Platform.OS === "android") {
    ToastAndroid.show(`${title}: ${message}`, ToastAndroid.LONG);
    return;
  }
  Alert.alert(title, message);
}