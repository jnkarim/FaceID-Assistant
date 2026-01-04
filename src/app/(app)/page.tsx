/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Camera,
  Info,
  UserPlus,
  Video,
  Scan,
  RefreshCw,
  Lock,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { loadFaceApiModels } from "@/lib/faceapi";
import { useRouter } from "next/navigation";
import axios from "axios";
import FaceIdGuide from "@/components/FaceIdGuide";
import FaceIdHeader from "@/components/FaceIdHeader";

declare global {
  interface Window {
    faceapi: any;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [recognizedName, setRecognizedName] = useState("");
  const [recognizedInfo, setRecognizedInfo] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showLightWarning, setShowLightWarning] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<
    "user" | "environment"
  >("environment");
  const [cameraError, setCameraError] = useState("");
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognizedNameRef = useRef("");
  const recognizedInfoRef = useRef("");
  const lastDetectionTimeRef = useRef<number>(Date.now());
  const streamRef = useRef<MediaStream | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/api/users/me");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/people");
      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data.users || []);
      }
    } catch {
      console.log("No users found yet");
    }
  };

  const startCamera = async (facingMode: "user" | "environment") => {
    if (!isAuthenticated) {
      setCameraError("Please login to use the camera");
      return;
    }

    setCameraError("");

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { exact: facingMode },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error with exact facingMode:", error);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: { ideal: facingMode },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (fallbackError) {
        console.error("Error with ideal facingMode:", fallbackError);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
          setCameraError(
            "Using default camera (device may have only one camera)"
          );
        } catch (finalError) {
          console.error("All camera access attempts failed:", finalError);
          setCameraError("Unable to access camera. Please check permissions.");
          setIsCameraActive(false);
        }
      }
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

  const updateRecognizedName = (name: string, info: string = "") => {
    if (
      recognizedNameRef.current !== name ||
      recognizedInfoRef.current !== info
    ) {
      recognizedNameRef.current = name;
      recognizedInfoRef.current = info;
      setRecognizedName(name);
      setRecognizedInfo(info);

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

      if (video.readyState !== 4) {
        return;
      }

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
        clearCanvas();

        const timeSinceLastDetection =
          Date.now() - lastDetectionTimeRef.current;
        if (timeSinceLastDetection >= 10000) {
          setShowLightWarning(true);
        }
        return;
      }

      lastDetectionTimeRef.current = Date.now();
      setShowLightWarning(false);

      const labeledDescriptors = registeredUsers.map(
        (user: any) =>
          new window.faceapi.LabeledFaceDescriptors(user.name, [
            new Float32Array(user.descriptor),
          ])
      );

      if (labeledDescriptors.length === 0) return;

      const faceMatcher = new window.faceapi.FaceMatcher(
        labeledDescriptors,
        0.6
      );
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      if (bestMatch.label !== "unknown") {
        const matchedUser = registeredUsers.find(
          (u: any) => u.name === bestMatch.label
        );
        const userInfo = matchedUser?.info || "";
        updateRecognizedName(bestMatch.label, userInfo);
        drawDetection(detection, bestMatch.label, video);
      } else {
        updateRecognizedName("Unknown Person", "");
        drawDetection(detection, "Unknown", video);
      }
    } catch (error) {
      console.error("Recognition error:", error);
    }
  };

  const drawDetection = (
    detection: any,
    label: string,
    video: HTMLVideoElement
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    window.faceapi.matchDimensions(canvas, displaySize);
    const resizedDetection = window.faceapi.resizeResults(
      detection,
      displaySize
    );

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

  const handleCameraSwitch = async () => {
    if (!isCameraActive || !isAuthenticated) return;

    setIsSwitchingCamera(true);
    clearCanvas();
    setRecognizedName("");
    setRecognizedInfo("");
    recognizedNameRef.current = "";
    recognizedInfoRef.current = "";

    const newFacingMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(newFacingMode);

    await startCamera(newFacingMode);

    setIsSwitchingCamera(false);
    lastDetectionTimeRef.current = Date.now();
  };

  const handleCameraToggle = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const willBeActive = !isCameraActive;
    setIsCameraActive(willBeActive);
    if (!willBeActive) {
      setRecognizedName("");
      setRecognizedInfo("");
      recognizedNameRef.current = "";
      recognizedInfoRef.current = "";
      setShowLightWarning(false);
      setCameraError("");
      stopCamera();
    } else {
      loadUsers();
      lastDetectionTimeRef.current = Date.now();
    }
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
    if (isCameraActive && isAuthenticated) {
      startCamera(cameraFacingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraActive, isAuthenticated, cameraFacingMode]);

  useEffect(() => {
    if (
      isCameraActive &&
      isModelLoaded &&
      registeredUsers.length > 0 &&
      !isSwitchingCamera &&
      isAuthenticated
    ) {
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
  }, [
    isCameraActive,
    isModelLoaded,
    registeredUsers.length,
    isSwitchingCamera,
    isAuthenticated,
  ]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-xl">Loading AI models...</div>
        </div>
      </div>
    );
  }

  if (!isModelLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 gap-4">
        <div className="text-red-400 text-xl text-center">
          Failed to load face recognition models.
          <br />
          Please check your internet connection and reload the page.
        </div>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-lime-400 text-black rounded-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const overlayBase =
    "px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 max-w-[90%] text-center shadow-lg";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-4 md:p-8">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <FaceIdHeader
          showGuide={showGuide}
          setShowGuide={setShowGuide}
          isAuthenticated={isAuthenticated}
          isCameraActive={isCameraActive}
          isSwitchingCamera={isSwitchingCamera}
          cameraFacingMode={cameraFacingMode}
          onCameraSwitch={handleCameraSwitch}
          onRegistrationComplete={loadUsers}
        />

        {/* Guide */}
        <FaceIdGuide showGuide={showGuide} />

        {/* Camera Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-stone-950 border border-neutral-800 rounded-2xl overflow-hidden mb-6 md:mb-8 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
              <div className="relative bg-black flex items-center justify-center aspect-video">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(0,0,0,0.7)_100%)]" />

                {isCameraActive && isAuthenticated ? (
                  <>
                    {/* Mirror only the video for front camera */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover brightness-110 contrast-105 ${
                        cameraFacingMode === "user" ? "scale-x-[-1]" : ""
                      }`}
                    />
                    {/* Canvas NOT mirrored so text is not reversed */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full mix-blend-lighten"
                    />

                    {isSwitchingCamera && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-12 h-12 text-lime-400 animate-spin" />
                          <div className="text-white font-semibold">
                            Switching camera...
                          </div>
                        </div>
                      </div>
                    )}

                    {recognizedName && !isSwitchingCamera && (
                      <div className="absolute bottom-4 left-4 w-[min(260px,80%)]">
                        <div className="bg-gradient-to-r from-lime-400 to-emerald-400 backdrop-blur-md rounded-xl border border-lime-400/40 shadow-lg overflow-hidden">
                          <div className="px-3 py-2.5">
                            <h3 className="text-sm font-semibold text-black truncate">
                              {recognizedName}
                            </h3>
                            {recognizedInfo && (
                              <p className="mt-1 text-xs text-neutral-800 line-clamp-3">
                                {recognizedInfo}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {cameraError && (
                      <div
                        className={`absolute top-3 right-3 bg-red-500/90 text-white ${overlayBase}`}
                      >
                        <Info size={14} className="flex-shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}

                    {registeredUsers.length === 0 && (
                      <div
                        className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400/95 text-black ${overlayBase}`}
                      >
                        <Info size={14} className="flex-shrink-0" />
                        <span>
                          No users registered yet. Please register a user first.
                        </span>
                      </div>
                    )}

                    {showLightWarning &&
                      registeredUsers.length > 0 &&
                      !isSwitchingCamera && (
                        <div
                          className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-orange-500/90 text-white ${overlayBase} animate-pulse`}
                        >
                          <Info size={14} className="flex-shrink-0" />
                          <span>
                            Move to better lighting for clearer recognition.
                          </span>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 p-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-800 rounded-full flex items-center justify-center">
                      {!isAuthenticated ? (
                        <Lock className="w-8 h-8 md:w-10 md:h-10 text-neutral-400" />
                      ) : (
                        <Camera className="w-8 h-8 md:w-10 md:h-10 text-neutral-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-neutral-300 text-lg md:text-xl mb-2">
                        {!isAuthenticated
                          ? "Login Required"
                          : "Camera Inactive"}
                      </div>
                      <p className="text-neutral-500 text-xs md:text-sm">
                        {!isAuthenticated
                          ? "Please login to use face recognition features."
                          : "Click Start Camera to begin face recognition."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control bar */}
              <div className="p-4 md:p-5 bg-black/70 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items(center gap-2 text-xs md:text-sm text-neutral-400">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCameraActive && isAuthenticated
                        ? "bg-lime-400 animate-pulse"
                        : "bg-neutral-600"
                    }`}
                  />
                  <span>
                    {isCameraActive && isAuthenticated
                      ? "Camera live • Face recognition running"
                      : "Camera idle"}
                  </span>
                </div>

                <div className="flex w-full sm:w-auto gap-2">
                  <button
                    type="button"
                    onClick={handleCameraToggle}
                    className="flex-1 sm:flex-initial px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base
                               bg-lime-400 text-black hover:bg-lime-300 transition flex items-center justify-center gap-2"
                  >
                    {!isAuthenticated ? (
                      <>
                        <Lock className="w-4 h-4 md:w-5 md:h-5" />
                        Login to Use Camera
                      </>
                    ) : isCameraActive ? (
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
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
              <div className="bg-stone-950 border border-neutral-800 rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Registered
                  </span>
                  <UserPlus className="w-4 h-4 text-lime-400" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-lime-300">
                  {registeredUsers.length}
                </div>
              </div>

              <div className="bg-stone-950 border border-neutral-800 rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Camera
                  </span>
                  <Video className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl md:text-3xl font-semibold text-blue-300">
                  {isCameraActive && isAuthenticated ? "Active" : "Off"}
                </div>
              </div>

              <div className="bg-stone-950 border border-neutral-800 rounded-xl p-3 md:p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Detection
                  </span>
                  <Scan className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-purple-300">
                  {recognizedName ? "✓" : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
