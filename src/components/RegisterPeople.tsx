"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import axios from "axios";

declare global {
  interface Window {
    faceapi: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle image selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ FIXED: Added "/" to properly check MIME type
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

  // Clear image
  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Register user
  const registerPeople = async () => {
    if (!userName.trim()) {
      setMessage({ type: "error", text: "Please enter a name" });
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
    setMessage({ type: "info", text: "Detecting face in photo..." });

    try {
      const detection = await window.faceapi
        .detectSingleFace(
          imageRef.current,
          new window.faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage({
          type: "error",
          text: "No face detected in the photo. Please try again",
        });
        setIsProcessing(false);
        return;
      }

      const response = await axios.post("/api/users", {
        name: userName.trim(),
        descriptor: Array.from(detection.descriptor),
      });

      // Success
      setMessage({
        type: "success",
        text: `User "${userName}" registered successfully!`,
      });
      setUserName("");
      clearImage();
      setShowRegisterModal(false);
      onRegistrationComplete();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
      const errMsg =
        error.response?.data?.error || error.message || "Registration failed";
      setMessage({ type: "error", text: errMsg });
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
        Register New User
      </button>
      {/* Message */}
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
              Register New User
            </h2>

            {/* Name Input */}
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white mb-4 focus:outline-none focus:border-lime-400"
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
                    className="w-full h-64 object-cover rounded-lg"
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
                  setShowRegisterModal(false);
                  setUserName("");
                  clearImage();
                  setMessage({ type: "", text: "" });
                }}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={registerPeople}
                disabled={isProcessing || !userName.trim() || !selectedImage}
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