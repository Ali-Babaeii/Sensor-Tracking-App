import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://ab27-2a02-908-1511-9ca0-e5ca-83af-3da1-d9b6.ngrok-free.app/api/data";

const sendDataToAPI = async (data) => {
  try {
    const magnetometerData = data.map(({ x, y, z, timestamp }) => ({
      x,
      y,
      z,
      timestamp,
    }));

    await axios.post(API_ENDPOINT, {
      data: magnetometerData,
    });

    await AsyncStorage.removeItem("magnetometerData");
    console.log("Data sent to API:");
  } catch (error) {
    console.error("Error sending data to API:");
  }
};

export { API_ENDPOINT, sendDataToAPI };
