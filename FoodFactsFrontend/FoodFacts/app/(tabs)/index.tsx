(Blob.prototype as any)[Symbol.toStringTag] = "Blob";
(File.prototype as any)[Symbol.toStringTag] = "File";

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Provider as PaperProvider, Button } from "react-native-paper";

export default function HomeScreen() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
      base64: true,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, base64 } = result.assets[0];
      console.log("Base64 camera image:", base64);
      setPhotoBase64(base64 || "");
      setPhotoUri(uri);
    }
  };

  const deletePhoto = () => {
    setPhotoBase64(null);
    setPhotoUri(null);
  };

  // This is the function that makes the API call:
  const calculateMacros = async () => {
    if (!photoBase64) return;

    try {
      //const blob = await uriToBlob(photo);

      // Construct form data
      //const formData = new FormData();
      //formData.append("image", blob, "food.jpg");

      //const file = new File([blob], "food.jpg", { type: "image/jpeg" });

      //const formData = new FormData();
      //formData.append("image", file);

      //const formData = new FormData();
      //formData.append("image", blob, "food.jpg");

      //console.log(blob.size);

      console.log("Base64 to send: ", photoBase64);

      // Make the request
      const response = await fetch("http://128.189.197.68:8000/upload/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: photoBase64 }),
      });

      // Parse the response
      const data = await response.json();
      console.log("Response from server:", data);
      // You can use data.ai to get the JSON returned by your model
      // e.g. {"Calories": ..., "Protein": ...}
    } catch (error) {
      console.error("Error during API call:", (error as Error).message);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Welcome to FoodFacts</Text>
        <Button mode="contained" onPress={openCamera}>
          Upload Photo
        </Button>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.image} />}
        {photoBase64 && (
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
              Get FoodFacts
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

// Updated uriToBlob function for better iOS support
async function uriToBlob(uri: string): Promise<Blob> {
  const resp = await fetch(uri);
  if (!resp.ok) {
    throw new Error(`Failed to fetch file: HTTP ${resp.status}`);
  }
  const blob = await resp.blob();
  console.log("Blob size:", blob.size);
  return blob;
}
