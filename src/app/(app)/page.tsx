"use client";

import { Camera } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import RegisterPeople from "@/components/RegisterPeople";


export default function HomePage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-8">
      {/*Header*/}
      <div className="w-full flex flex-row items-center justify-between mb-8">
        {/*name and tagline*/}
        <div className="flex flex-col items-start">
          <div className="text-3xl text-white font-semibold">
            FaceID Assistant
          </div>
          <div className="text-lg text-neutral-400">
            Smart Recognition System
          </div>
        </div>
        {/*Button*/}
       <RegisterPeople onRegistrationComplete={() => console.log("Registration complete")} />

      </div>

      {/*Camera Content*/}
      <div className="flex-1 overflow-auto">
        {" "}
        {/*Add scrollbar if content exceeds container size*/}
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-950 border-2 border-black rounded-2xl overflow-hidden mb-8">
            <div className="relative aspect-video flex items-center justify-center bg-black">
              {isCameraActive ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 1920,
                    height: 1080,
                    facingMode: "user",
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  {" "}
                  {/*child becomes exactly the same size as the parent*/}
                  <Camera className="w-12 h-12 text-neutral-400" />
                  <div className="text-neutral-400 text-xl">
                    Camera Inactive
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-black/60 border-t border-lime-500/20 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsCameraActive(!isCameraActive);
                }}
                className="w-full px-6 py-4 bg-lime-400 hover:bg-lime-300 transition text-black text-lg rounded-xl font-bold"
              >
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
