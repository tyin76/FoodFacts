import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Provider as PaperProvider, Button } from "react-native-paper";

export default function HomeScreen() {
  const [photo, setPhoto] = useState<string | null>(null);

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission denied",
        "Camera access is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      console.log("Photo URI:", result.assets[0].uri);
    }
  };

  const deletePhoto = () => {
    setPhoto(null);
  };

  const calculateMacros = () => {
    deletePhoto();
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Welcome to FoodFacts</Text>
        <Button mode="contained" onPress={openCamera}>
          Upload Photo
        </Button>
        {photo && <Image source={{ uri: photo }} style={styles.image} />}
        {photo && (
          <>
            <Button
              mode="contained"
              onPress={deletePhoto}
              style={styles.button}
            >
              Delete Photo
            </Button>
            <Button
              mode="contained"
              onPress={calculateMacros}
              style={styles.button}
            >
              Calculate Macros
            </Button>
          </>
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "black",
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "Trebuchet MS",
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
  },
});
