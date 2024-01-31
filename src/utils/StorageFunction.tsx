import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import { sendDataToAPI } from "../services/ApiService";

const BATCH_SIZE = 10;
let isAlertShown = false;

const saveDataToStorage = async (data) => {
  try {
    const existingData = await getDataFromStorage();
    const newData = [...existingData, data];
    await AsyncStorage.setItem("magnetometerData", JSON.stringify(newData));

    if (newData.length >= BATCH_SIZE) {
      const isConnected = await checkInternetConnection();

      if (isConnected) {
        isAlertShown = false;
        await sendDataToAPI(newData);
      } else {
        if (!isAlertShown) {
          Alert.alert(
            "No internet connection",
            " Please check your internet connection!"
          );
          isAlertShown = true;
        }
      }
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

const getDataFromStorage = async () => {
  try {
    const data = await AsyncStorage.getItem("magnetometerData");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error retrieving data:", error);
    return [];
  }
};

const checkInternetConnection = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  } catch (error) {
    console.error("Error checking internet connection:", error);
    return false;
  }
};

export { saveDataToStorage, getDataFromStorage };
