"use client";

import { Camera, Info, CheckCircle, UserPlus, Video, Scan } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { loadFaceApiModels } from "@/lib/faceapi";

declare global {
  interface Window {
    faceapi: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export default function HomePage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [recognizedName, setRecognizedName] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showLightWarning, setShowLightWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognizedNameRef = useRef("");
  const lastDetectionTimeRef = useRef<number>(Date.now());
  const streamRef = useRef<MediaStream | null>(null);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/people");
      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data.users?.map((u: any) => u.name) || []); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch (error) {
      console.log("No users found yet");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, facingMode: { ideal: "environment" } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const updateRecognizedName = (name: string) => {
    if (recognizedNameRef.current !== name) {
      recognizedNameRef.current = name;
      setRecognizedName(name);

      if (name) {
        lastDetectionTimeRef.current = Date.now();
        setShowLightWarning(false);
      }
    }
  };

  const recognizeFace = async () => {
    if (!videoRef.current) return;
    if (registeredUsers.length === 0) return;
    if (!window.faceapi) {
      console.error("face-api not loaded!");
      return;
    }

    try {
      const video = videoRef.current;
      if (video.readyState !== 4) return;

      const detection = await window.faceapi
        .detectSingleFace(
          video,
          new window.faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.3,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        updateRecognizedName("");
        clearCanvas();

        const timeSinceLastDetection = Date.now() - lastDetectionTimeRef.current;
        if (timeSinceLastDetection >= 10000) {
          setShowLightWarning(true);
        }
        return;
      }

      lastDetectionTimeRef.current = Date.now();
      setShowLightWarning(false);

      const response = await fetch("/api/users/people");
      if (!response.ok) return;

      const data = await response.json();
      const labeledDescriptors = data.users.map(
        (user: any) =>
          new window.faceapi.LabeledFaceDescriptors(user.name, [
            new Float32Array(user.descriptor),
          ])
      );

      if (labeledDescriptors.length === 0) return;

      const faceMatcher = new window.faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      if (bestMatch.label !== "unknown") {
        updateRecognizedName(bestMatch.label);
        drawDetection(detection, bestMatch.label, video);
      } else {
        updateRecognizedName("Unknown Person");
        drawDetection(detection, "Unknown", video);
      }
    } catch (error) {
      console.error("Recognition error:", error);
    }
  };

  const drawDetection = (detection: any, label: string, video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    window.faceapi.matchDimensions(canvas, displaySize);
    const resizedDetection = window.faceapi.resizeResults(detection, displaySize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const box = resizedDetection.detection.box;
    ctx.strokeStyle = label !== "Unknown" ? "#a3e635" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    ctx.fillStyle = label !== "Unknown" ? "#a3e635" : "#ef4444";
    ctx.font = "bold 20px Arial";
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(box.x, box.y - 35, textWidth + 20, 35);
    ctx.fillStyle = "black";
    ctx.fillText(label, box.x + 10, box.y - 10);
  };

  useEffect(() => {
    const init = async () => {
      console.log("Loading face-api models...");
      const loaded = await loadFaceApiModels();
      console.log("Models loaded:", loaded);
      setIsModelLoaded(loaded);
      setLoading(false);
      if (loaded) {
        await loadUsers();
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive]);

  useEffect(() => {
    if (isCameraActive && isModelLoaded && registeredUsers.length > 0) {
      lastDetectionTimeRef.current = Date.now();
      detectionIntervalRef.current = setInterval(() => {
        recognizeFace();
      }, 500);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      clearCanvas();
      setShowLightWarning(false);
    };
  }, [isCameraActive, isModelLoaded, registeredUsers.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading AI models...</div>
        </div>
      </div>
    );
  }

  if (!isModelLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-red-400 text-xl">
          Failed to load face recognition models. Check console for errors.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 md:p-8">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 border-b pb-4 md:pb-6 border-neutral-700 gap-4">
        <div className="flex flex-col items-start">
          <div className="text-2xl md:text-3xl text-white font-semibold">FaceID Assistant</div>
          <div className="text-base md:text-lg text-neutral-400">Smart Recognition System</div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 md:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm md:text-base"
          >
            <Info size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">{showGuide ? 'Hide Guide' : 'Show Guide'}</span>
            <span className="sm:hidden">{showGuide ? 'Hide' : 'Guide'}</span>
          </button>
          <button className="px-3 md:px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black rounded-xl font-medium transition flex items-center gap-2 text-sm md:text-base">
            <UserPlus size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Register New People</span>
            <span className="sm:hidden">Register</span>
          </button>
        </div>
      </div>

      {/* Interactive Guide */}
      {showGuide && (
        <div className="max-w-4xl mx-auto mb-6 md:mb-8 w-full">
          <div className="bg-black border-2 border-lime-400/30 rounded-2xl p-4 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 md:w-5 md:h-5 text-black" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">How to Use FaceID Assistant</h3>
                <p className="text-sm md:text-base text-neutral-300 mb-4">Follow these simple steps to get started with face recognition</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-neutral-800/50 rounded-xl p-3 md:p-4 border border-neutral-700">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                    1
                  </div>
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
                </div>
                <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Register Users</h4>
                <p className="text-neutral-400 text-xs md:text-sm">Click {"Register New People"} button, enter a name, and capture your face.</p>
              </div>

              <div className="bg-neutral-800/50 rounded-xl p-3 md:p-4 border border-neutral-700">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                    2
                  </div>
                  <Video className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
                </div>
                <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Start Camera</h4>
                <p className="text-neutral-400 text-xs md:text-sm">Click {"Start Camera"} to activate the webcam. Ensure good lighting.</p>
              </div>

              <div className="bg-neutral-800/50 rounded-xl p-3 md:p-4 border border-neutral-700">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                    3
                  </div>
                  <Scan className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
                </div>
                <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">Get Recognized</h4>
                <p className="text-neutral-400 text-xs md:text-sm">Look at the camera and the system will automatically identify registered users.</p>
              </div>
            </div>

            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-neutral-300">
                  <span className="font-semibold text-white">Pro Tips:</span> Use good lighting, face the camera directly, and stay 2-3 feet away for optimal recognition. Green box = recognized user, Red box = unknown person.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-950 border-2 border-black rounded-2xl overflow-hidden mb-6 md:mb-8">
            <div className="relative aspect-video flex items-center justify-center bg-black">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  {recognizedName && (
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/70 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-sm md:text-lg">
                      {recognizedName}
                    </div>
                  )}
                  {registeredUsers.length === 0 && (
                    <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 max-w-[90%] text-center">
                      <Info size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                      <span>No users registered yet. Please register a user first!</span>
                    </div>
                  )}
                  {showLightWarning && registeredUsers.length > 0 && (
                    <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500/90 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 max-w-[90%] text-center animate-pulse">
                      <Info size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                      <span>Put your face in more light</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 p-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-800 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 md:w-10 md:h-10 text-neutral-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-neutral-400 text-lg md:text-xl mb-2">Camera Inactive</div>
                    <p className="text-neutral-500 text-xs md:text-sm">Click {"Start Camera"} to begin face recognition</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 md:p-6 bg-black/60 border-t border-lime-500/20 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const willBeActive = !isCameraActive;
                  setIsCameraActive(willBeActive);
                  if (!willBeActive) {
                    setRecognizedName("");
                    recognizedNameRef.current = "";
                    setShowLightWarning(false);
                  } else {
                    loadUsers();
                    lastDetectionTimeRef.current = Date.now();
                  }
                }}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-lime-400 hover:bg-lime-300 transition text-black text-base md:text-lg rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isCameraActive ? (
                  <>
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 md:w-5 md:h-5" />
                    Start Camera
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-stone-950 border-2 border-black rounded-xl p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-lime-400">{registeredUsers.length}</div>
              <div className="text-neutral-400 text-xs md:text-sm mt-1">Registered Users</div>
            </div>
            <div className="bg-stone-950 border-2 border-black rounded-xl p-3 md:p-4 text-center">
              <div className="text-xl md:text-3xl font-bold text-blue-400">{isCameraActive ? 'Active' : 'Off'}</div>
              <div className="text-neutral-400 text-xs md:text-sm mt-1">Camera Status</div>
            </div>
            <div className="bg-stone-950 border-2 border-black rounded-xl p-3 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400">{recognizedName ? '✓' : '—'}</div>
              <div className="text-neutral-400 text-xs md:text-sm mt-1">Detection Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}