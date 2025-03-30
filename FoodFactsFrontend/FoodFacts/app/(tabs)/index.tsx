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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Provider as PaperProvider, Button } from "react-native-paper";

export default function HomeScreen() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [foodFacts, setFoodFacts] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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
      // Set analyzing state to true to show loading indicator
      setIsAnalyzing(true);

      console.log("Base64 to send: ", photoBase64);

      // Make the request
      const response = await fetch("http://128.189.195.73:8000/upload/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: photoBase64 }),
      });

      // Parse the response
      const data = await response.json();
      console.log("Response from server:", data);
      setFoodFacts(data);
      // You can use data.ai to get the JSON returned by your model
      // e.g. {"Calories": ..., "Protein": ...}
    } catch (error) {
      console.error("Error during API call:", (error as Error).message);
      Alert.alert("Error", "Failed to analyze the food. Please try again.");
    } finally {
      // Set analyzing state to false when done (whether success or error)
      setIsAnalyzing(false);
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
              disabled={isAnalyzing}
            >
              Delete Photo
            </Button>
            <Button
              mode="contained"
              onPress={calculateMacros}
              style={styles.button}
              disabled={isAnalyzing}
            >
              Get FoodFacts
            </Button>
          </>
        )}

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Analyzing food...</Text>
          </View>
        )}

        {foodFacts && photoBase64 && !isAnalyzing && (
          <View style={styles.factsContainer}>
            <Text style={styles.factText}>
              Calories: {foodFacts.Calories || 0}
            </Text>
            <Text style={styles.factText}>Carbs: {foodFacts.Carbs || 0} g</Text>
            <Text style={styles.factText}>
              Protein: {foodFacts.Protein || 0} g
            </Text>
            <Text style={styles.factText}>
              Sodium: {foodFacts.Sodium || 0} mg
            </Text>
            <Text style={styles.factText}>
              Vitamin A: {foodFacts["Vitamin A"] || 0} mcg
            </Text>
            <Text style={styles.factText}>
              Vitamin C: {foodFacts["Vitamin C"] || 0} mg
            </Text>
          </View>
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
  factsContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  factText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Trebuchet MS",
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    fontFamily: "Trebuchet MS",
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
