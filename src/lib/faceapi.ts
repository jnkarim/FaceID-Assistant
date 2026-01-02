/* eslint-disable @typescript-eslint/no-explicit-any */
let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;

  try {
    // Ensure we are in the browser
    if (typeof window === "undefined") {
      console.error("Cannot load face-api models on server");
      return false;
    }

    // Load face-api if not already present (instead of just failing)
    if (!(window as any).faceapi) {
      const faceapiModule = await import("face-api.js"); // client-side dynamic import
      (window as any).faceapi = faceapiModule;
    }

    const faceapi = (window as any).faceapi;
    const MODEL_URL = "/models"; // public/models/*

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log("Face-api models loaded successfully");
    return true;
  } catch (error) {
    console.error("Failed to load face-api models:", error);
    return false;
  }
};

export const isFaceApiLoaded = () => modelsLoaded;
