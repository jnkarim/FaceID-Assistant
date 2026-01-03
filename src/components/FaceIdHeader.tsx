"use client";

import { Info, RefreshCw, UserPlus } from "lucide-react";
import RegisterPeople from "@/components/RegisterPeople";

interface FaceIdHeaderProps {
  showGuide: boolean;
  setShowGuide: (value: boolean) => void;
  isAuthenticated: boolean;
  isCameraActive: boolean;
  isSwitchingCamera: boolean;
  cameraFacingMode: "user" | "environment";
  onCameraSwitch: () => void;
  onRegistrationComplete: () => void;
}

export default function FaceIdHeader({
  showGuide,
  setShowGuide,
  isAuthenticated,
  isCameraActive,
  isSwitchingCamera,
  cameraFacingMode,
  onCameraSwitch,
  onRegistrationComplete,
}: FaceIdHeaderProps) {
  return (
    <header className="w-full mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            FaceID <span className="text-lime-400">Assistant</span>
          </h1>
          <p className="text-neutral-400 text-sm md:text-base mt-1">
            Real-time face recognition with temporal smoothing for stability.
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm md:text-base"
          >
            <Info size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">
              {showGuide ? "Hide Guide" : "Show Guide"}
            </span>
            <span className="sm:hidden">
              {showGuide ? "Hide" : "Guide"}
            </span>
          </button>

          {isAuthenticated && (
            <RegisterPeople onRegistrationComplete={onRegistrationComplete} />
          )}

          {/* Mobile camera switch */}
          <button
            type="button"
            onClick={onCameraSwitch}
            disabled={!isCameraActive || isSwitchingCamera || !isAuthenticated}
            className="px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-xl font-medium transition flex items-center gap-2 text-sm md:text-base md:hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={16}
              className={isSwitchingCamera ? "animate-spin" : ""}
            />
            <span>
              {isSwitchingCamera
                ? "Switching..."
                : cameraFacingMode === "user"
                ? "Back Camera"
                : "Front Camera"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
