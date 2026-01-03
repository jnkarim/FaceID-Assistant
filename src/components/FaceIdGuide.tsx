/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Info, CheckCircle, UserPlus, Video, Scan } from "lucide-react";

interface FaceIdGuideProps {
  showGuide: boolean;
}

const FaceIdGuide: React.FC<FaceIdGuideProps> = ({ showGuide }) => {
  if (!showGuide) return null;

  return (
    <div className="max-w-4xl mx-auto mb-6 md:mb-8 w-full">
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-lime-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">
              How to Use FaceID Assistant
            </h3>
            <p className="text-sm md:text-base text-neutral-300">
              Follow these simple steps to get started with face recognition.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-2">
          <div className="bg-neutral-900/70 rounded-xl p-3 md:p-4 border border-neutral-800">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                1
              </div>
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
            </div>
            <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Register Users
            </h4>
            <p className="text-neutral-300 text-xs md:text-sm">
              Click the Register New People button, enter a name, and capture
              the face to save a new profile.
            </p>
          </div>

          <div className="bg-neutral-900/70 rounded-xl p-3 md:p-4 border border-neutral-800">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                2
              </div>
              <Video className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
            </div>
            <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Start Camera
            </h4>
            <p className="text-neutral-300 text-xs md:text-sm">
              Click Start Camera to activate the webcam. Use the switch button
              to toggle between front and back cameras on mobile.
            </p>
          </div>

          <div className="bg-neutral-900/70 rounded-xl p-3 md:p-4 border border-neutral-800">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm md:text-base">
                3
              </div>
              <Scan className="w-4 h-4 md:w-5 md:h-5 text-lime-400" />
            </div>
            <h4 className="text-white font-semibold mb-1 md:mb-2 text-sm md:text-base">
              Get Recognized
            </h4>
            <p className="text-neutral-300 text-xs md:text-sm">
              Look at the camera and the system will automatically identify
              registered users with stable, smooth detection.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs md:text-sm text-neutral-400">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-lime-400 mt-[2px]" />
          <p>
            <span className="font-semibold text-lime-300">Pro tip:</span> Good
            lighting, a front-facing pose, and standing 2–3 feet from the camera
            will improve recognition accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaceIdGuide;
