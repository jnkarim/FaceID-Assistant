let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return true;
  
  try {
    // Wait for face-api to be loaded from CDN
    if (typeof window === 'undefined' || !(window as any).faceapi) {// eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('face-api.js not loaded from CDN');
      return false;
    }

    const MODEL_URL = '/models';
    const faceapi = (window as any).faceapi;// eslint-disable-line @typescript-eslint/no-explicit-any
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face-api models loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load face-api models:', error);
    return false;
  }
};

export const isFaceApiLoaded = () => modelsLoaded;