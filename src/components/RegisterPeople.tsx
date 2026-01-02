/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";
import { loadFaceApiModels } from "@/lib/faceapi";

declare global {
  interface Window {
    faceapi: any;
  }
}

interface RegisterPeopleProps {
  onRegistrationComplete: () => void;
}

export default function RegisterPeople({
  onRegistrationComplete,
}: RegisterPeopleProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "" | "error" | "success" | "info"; text: string }>({
    type: "",
    text: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setMessage({ type: "", text: "" });
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeModalAndReset = () => {
    setShowRegisterModal(false);
    setUserName("");
    setUserInfo("");
    clearImage();
  };

  const registerPeople = async () => {
    if (!userName.trim()) {
      setMessage({ type: "error", text: "Please enter a name" });
      return;
    }
    if (!userInfo.trim()) {
      setMessage({ type: "error", text: "Please enter the info of the user" });
      return;
    }
    if (!selectedImage) {
      setMessage({ type: "error", text: "Please upload a photo" });
      return;
    }
    if (!imageRef.current) {
      setMessage({ type: "error", text: "Image not loaded yet" });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: "info", text: "Loading face recognition models..." });

    console.log("Sending data:", {
      name: userName.trim(),
      info: userInfo.trim(),
      hasDescriptor: true,
    });

    const modelsOk = await loadFaceApiModels();
    if (!modelsOk) {
      setIsProcessing(false);
      setMessage({
        type: "error",
        text: "Failed to load face recognition models. Please reload the page.",
      });
      // close modal but keep error visible
      closeModalAndReset();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      return;
    }

    setMessage({ type: "info", text: "Detecting face in photo..." });

    try {
      const faceapi = window.faceapi;

      const detection = await faceapi
        .detectSingleFace(
          imageRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage({
          type: "error",
          text: "No face detected in the photo. Please try again",
        });
        setIsProcessing(false);
        // close modal but keep error visible
        closeModalAndReset();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }

      await axios.post("/api/users/people", {
        name: userName.trim(),
        info: userInfo.trim(),
        descriptor: Array.from(detection.descriptor),
      });

      setMessage({
        type: "success",
        text: `Person "${userName}" registered successfully!`,
      });
      closeModalAndReset();
      onRegistrationComplete();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {
      console.error("Registration error:", error);

      let errMsg = "Registration failed";

      if (error.response?.status === 409) {
        errMsg = `Person with name "${userName}" already exists. Please use a different name or delete the existing person first.`;
      } else if (error.response?.status === 401) {
        errMsg = "Authentication failed. Please log in again.";
      } else if (error.response?.data?.error) {
        errMsg = error.response.data.error;
      } else if (error.message) {
        errMsg = error.message;
      }

      setMessage({ type: "error", text: errMsg });
      // close modal but keep error visible
      closeModalAndReset();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }

    setIsProcessing(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowRegisterModal(true)}
        className="px-8 py-4 bg-lime-400 hover:bg-lime-300 transition rounded-lg text-black font-semibold flex items-center gap-2"
      >
        <Upload size={20} />
        Register New People
      </button>

      {/* Global message bar (visible even when modal is closed) */}
      {message.text && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === "error"
              ? "bg-red-500/20 text-red-300 border border-red-500"
              : message.type === "success"
              ? "bg-green-500/20 text-green-300 border border-green-500"
              : "bg-blue-500/20 text-blue-300 border border-blue-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border-2 border-lime-500 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              Register New Person
            </h2>

            {/* Name Input */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter Full Name"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white mb-4 focus:outline-none focus:border-lime-400"
            />
            <textarea
              value={userInfo}
              onChange={(e) => {
                setUserInfo(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Enter Info About The User"
              rows={1}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white mb-4 focus:outline-none focus:border-lime-400 resize-none overflow-hidden"
            />

            {/* Image Upload */}
            <div className="mb-4">
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center cursor-pointer hover:border-lime-400 transition"
                >
                  <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                  <p className="text-neutral-400 mb-1">Click to upload photo</p>
                  <p className="text-neutral-600 text-sm">JPG, PNG (Max 5MB)</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-auto rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  closeModalAndReset();
                  setMessage({ type: "", text: "" });
                }}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={registerPeople}
                disabled={
                  isProcessing ||
                  !userName.trim() ||
                  !userInfo.trim() ||
                  !selectedImage
                }
                className="flex-1 px-4 py-3 bg-lime-400 hover:bg-lime-300 text-black rounded-lg font-bold transition disabled:bg-neutral-600 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Register"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
