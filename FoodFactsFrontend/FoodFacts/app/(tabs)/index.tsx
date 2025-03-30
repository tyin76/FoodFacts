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
  StatusBar,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Provider as PaperProvider,
  Button,
  Surface,
  ActivityIndicator,
  Portal,
  Dialog,
  ProgressBar,
} from "react-native-paper";

function getCaloriesProgress(value: number) {
  return { progress: value / 2200, color: value < 2200 ? "orange" : "green" };
}

function getCarbsProgress(value: number) {
  return { progress: value / 300, color: value < 300 ? "orange" : "green" };
}

function getProteinProgress(value: number) {
  return { progress: value / 70, color: value < 70 ? "orange" : "green" };
}

function getSodiumProgress(value: number) {
  return { progress: value / 1500, color: value < 1500 ? "orange" : "green" };
}

function getVitaminAProgress(value: number) {
  return { progress: value / 900, color: value < 900 ? "orange" : "green" };
}

function getVitaminCProgress(value: number) {
  return { progress: value / 85, color: value < 85 ? "orange" : "green" };
}

type GradeInfo = {
  color: string;
  grade: string;
};

// Example: compute a simple letter grade based on calories
function computeGrade(foodFacts: any): GradeInfo {
  let score = 0;

  // 1) Calories
  const calories = foodFacts.Calories ?? 0;
  if (calories === 0) {
    score += 0;
  } else if (calories < 200) {
    score += 3;
  } else if (calories < 500) {
    score += 2;
  } else {
    score += 1;
  }

  // 2) Carbs
  const carbs = foodFacts.Carbs ?? 0;
  if (carbs === 0) {
    score += 0;
  } else if (carbs < 20) {
    score += 3;
  } else if (carbs < 50) {
    score += 2;
  } else {
    score += 1;
  }

  // 3) Protein
  const protein = foodFacts.Protein ?? 0;
  if (protein === 0) {
    score += 0;
  } else if (protein > 20) {
    score += 3;
  } else if (protein > 10) {
    score += 2;
  } else {
    score += 1;
  }

  // 4) Sodium
  const sodium = foodFacts.Sodium ?? 0;
  if (sodium === 0) {
    score += 0;
  } else if (sodium < 150) {
    score += 3;
  } else if (sodium < 300) {
    score += 2;
  } else {
    score += 1;
  }

  // 5) Vitamin A
  const vitaminA = foodFacts["Vitamin A"] ?? 0;
  if (vitaminA === 0) {
    score += 0;
  } else if (vitaminA > 700) {
    score += 3;
  } else if (vitaminA > 400) {
    score += 2;
  } else {
    score += 1;
  }

  // 6) Vitamin C
  const vitaminC = foodFacts["Vitamin C"] ?? 0;
  if (vitaminC === 0) {
    score += 0;
  } else if (vitaminC > 60) {
    score += 3;
  } else if (vitaminC > 30) {
    score += 2;
  } else {
    score += 1;
  }

  // Convert total score to a letter grade
  // Max score = 6 fields * 3 points each = 18
  if (score >= 15) {
    return { color: "green", grade: "A" };
  } else if (score >= 11) {
    return { color: "teal", grade: "B" };
  } else if (score >= 7) {
    return { color: "orange", grade: "C" };
  } else {
    return { color: "red", grade: "D" };
  }
}

export default function HomeScreen() {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [foodFacts, setFoodFacts] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Grade for the uploaded food
  const [foodGrade, setFoodGrade] = useState<GradeInfo | null>(null);

  // Controls visibility of the pop-out
  const [showFactsModal, setShowFactsModal] = useState<boolean>(false);

  // second pop-up for the grade details (progress bars)
  const [showGradeDetail, setShowGradeDetail] = useState<boolean>(false);

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
    setFoodFacts(null);
    setFoodGrade(null);
    setShowFactsModal(false); // Hide dialog if open
    setShowGradeDetail(false);
  };

  const calculateMacros = async () => {
    if (!photoBase64) return;

    try {
      setLoading(true);
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

      // Compute and store the grade
      const grade = computeGrade(data);
      setFoodGrade(grade);

      // Auto-show the dialog when data arrives
      setShowFactsModal(true);
    } catch (error) {
      console.error("Error during API call:", (error as Error).message);
      Alert.alert("Error", "Failed to analyze food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>FoodFacts</Text>
          <Text style={styles.subtitle}>Analyze your food with one photo</Text>
        </View>

        <Surface style={styles.contentCard}>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.image} />
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={deletePhoto}
                  style={[styles.button, styles.deleteButton]}
                  textColor="black"
                  icon="delete"
                  disabled={loading}
                >
                  Delete
                </Button>
                <Button
                  mode="contained"
                  onPress={calculateMacros}
                  style={[styles.button, styles.analyzeButton]}
                  disabled={loading}
                  icon="calculator"
                  textColor="white"
                >
                  {loading ? "Analyzing..." : "Analyze Food"}
                </Button>
              </View>

              {/* Show the Grade below the buttons if data, a grade, not loading, and the main dialog is closed */}
              {foodFacts && foodGrade && !loading && !showFactsModal && (
                <TouchableOpacity onPress={() => setShowGradeDetail(true)}>
                  <View style={styles.gradeContainer}>
                    <Text style={styles.gradeTitle}>Grade:</Text>
                    <Text
                      style={[styles.gradeValue, { color: foodGrade.color }]}
                    >
                      {foodGrade.grade}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.uploadContainer}>
              <Button
                mode="contained"
                onPress={openCamera}
                style={styles.uploadButton}
                icon="camera"
              >
                Take Food Photo
              </Button>
            </View>
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>Analyzing your food...</Text>
            </View>
          )}
        </Surface>

        {foodFacts && !loading && (
          <Button
            mode="contained"
            onPress={() => setShowFactsModal(true)}
            style={styles.showFactsButton}
            icon="information"
          >
            Show Nutrition Facts
          </Button>
        )}

        {/* --------------------- Dialogs in a Portal --------------------- */}
        <Portal>
          {/* Main Nutrition Facts Dialog */}
          <Dialog
            visible={showFactsModal}
            onDismiss={() => setShowFactsModal(false)}
          >
            <Dialog.Title style={styles.dialogTitle}>
              Nutrition Facts
            </Dialog.Title>
            {foodFacts ? (
              <Dialog.ScrollArea>
                <View>
                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Calories</Text>
                    <Text style={styles.factValue}>
                      {foodFacts.Calories || 0} kcal
                    </Text>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Carbs</Text>
                    <Text style={styles.factValue}>
                      {foodFacts.Carbs || 0} g
                    </Text>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Protein</Text>
                    <Text style={styles.factValue}>
                      {foodFacts.Protein || 0} g
                    </Text>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Sodium</Text>
                    <Text style={styles.factValue}>
                      {foodFacts.Sodium || 0} mg
                    </Text>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Vitamin A</Text>
                    <Text style={styles.factValue}>
                      {foodFacts["Vitamin A"] || 0} mcg
                    </Text>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.factRow}>
                    <Text style={styles.factLabel}>Vitamin C</Text>
                    <Text style={styles.factValue}>
                      {foodFacts["Vitamin C"] || 0} mg
                    </Text>
                  </View>
                </View>
              </Dialog.ScrollArea>
            ) : null}
            <Dialog.Actions>
              <Button onPress={() => setShowFactsModal(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Second: Grade Detail Dialog with progress bars */}
          <Dialog
            visible={showGradeDetail}
            onDismiss={() => setShowGradeDetail(false)}
          >
            <Dialog.Title style={styles.dialogTitle}>
              Percentage of Recommended Daily Intake
            </Dialog.Title>
            {foodFacts && (
              <Dialog.ScrollArea>
                <View style={{ paddingHorizontal: 20 }}>
                  {/* Calories */}
                  <Text style={styles.progressLabel}>Calories</Text>
                  {(() => {
                    const cals = foodFacts.Calories || 0;
                    const { progress, color } = getCaloriesProgress(cals);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{cals} kcal</Text>
                      </>
                    );
                  })()}

                  {/* Carbs */}
                  <Text style={styles.progressLabel}>Carbs</Text>
                  {(() => {
                    const val = foodFacts.Carbs || 0;
                    const { progress, color } = getCarbsProgress(val);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{val} g</Text>
                      </>
                    );
                  })()}

                  {/* Protein */}
                  <Text style={styles.progressLabel}>Protein</Text>
                  {(() => {
                    const val = foodFacts.Protein || 0;
                    const { progress, color } = getProteinProgress(val);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{val} g</Text>
                      </>
                    );
                  })()}

                  {/* Sodium */}
                  <Text style={styles.progressLabel}>Sodium</Text>
                  {(() => {
                    const val = foodFacts.Sodium || 0;
                    const { progress, color } = getSodiumProgress(val);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{val} mg</Text>
                      </>
                    );
                  })()}

                  {/* Vitamin A */}
                  <Text style={styles.progressLabel}>Vitamin A</Text>
                  {(() => {
                    const val = foodFacts["Vitamin A"] || 0;
                    const { progress, color } = getVitaminAProgress(val);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{val} mcg</Text>
                      </>
                    );
                  })()}

                  {/* Vitamin C */}
                  <Text style={styles.progressLabel}>Vitamin C</Text>
                  {(() => {
                    const val = foodFacts["Vitamin C"] || 0;
                    const { progress, color } = getVitaminCProgress(val);
                    return (
                      <>
                        <ProgressBar
                          progress={progress}
                          color={color}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressValue}>{val} mg</Text>
                      </>
                    );
                  })()}
                </View>
              </Dialog.ScrollArea>
            )}
            <Dialog.Actions>
              <Button onPress={() => setShowGradeDetail(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
}

// --------------------- Styles ---------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    // Gentle shadow under the header
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 3,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 4,
    fontFamily: "Trebuchet MS",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "Trebuchet MS",
  },
  contentCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    flex: 1,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  uploadContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    backgroundColor: "#f5f5f5",
  },
  uploadButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  photoContainer: {
    alignItems: "center",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: "contain",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
  },
  deleteButton: {
    borderColor: "#ff5252",
  },
  analyzeButton: {
    backgroundColor: "#6200ee",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666666",
    fontFamily: "Trebuchet MS",
  },
  showFactsButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },

  // Grade area
  gradeContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    borderColor: "#DDA0DD",
    borderWidth: 1,
  },
  gradeTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Trebuchet MS",
    color: "#6F4685",
    marginBottom: 4,
  },
  gradeValue: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Trebuchet MS",
  },

  // Dialog styling
  dialogTitle: {
    fontFamily: "Trebuchet MS",
    fontWeight: "bold",
  },
  factRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  factLabel: {
    fontSize: 16,
    color: "white",
    fontFamily: "Trebuchet MS",
    fontWeight: "500",
  },
  factValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    fontFamily: "Trebuchet MS",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },

  // Progress bar styling inside the Grade Detail Dialog
  progressLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Trebuchet MS",
    color: "white",
  },
  progressBar: {
    height: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  progressValue: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Trebuchet MS",
    color: "white",
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
