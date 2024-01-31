import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { Magnetometer } from "expo-sensors";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import {
  saveDataToStorage,
  getDataFromStorage,
} from "../utils/StorageFunction";
import { sendDataToAPI } from "../services/ApiService";

const BACKGROUND_FETCH_TASK = "background-fetch-task";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const collectedData = await getDataFromStorage();
  if (collectedData.length > 0) {
    sendDataToAPI(collectedData);
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 1,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export default function MainScreen() {
  const [isMagnetometerEnabled, setIsMagnetometerEnabled] = useState(false);

  const checkStatusAsync = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK
    );
    setIsMagnetometerEnabled(isRegistered);
  };

  useEffect(() => {
    Magnetometer.addListener(handleMagnetometerData);
    Magnetometer.setUpdateInterval(1000);
    checkStatusAsync();
  }, [isMagnetometerEnabled]);

  const handleMagnetometerData = ({ x, y, z }) => {
    const timestamp = new Date().toLocaleString();
    if (isMagnetometerEnabled) {
      saveDataToStorage({ x, y, z, timestamp });
    }
  };

  const toggleMagnetometer = async () => {
    if (isMagnetometerEnabled) {
      Magnetometer.removeAllListeners();
      await unregisterBackgroundFetchAsync();
    } else {
      Magnetometer.addListener(handleMagnetometerData);
      Magnetometer.setUpdateInterval(1000);
      await registerBackgroundFetchAsync();
    }

    setIsMagnetometerEnabled((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Switch
        value={isMagnetometerEnabled}
        onValueChange={toggleMagnetometer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
});
