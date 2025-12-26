"use client";

import axios from "axios";
import { Eye, EyeOff, Radar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export interface Login {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/users/login", formData);
      router.push("./");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log("Login failed. Try again.", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
      {/* Header - Mobile Optimized */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between sm:justify-center border-b border-black lg:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
          <Link href="/" className="text-white text-base sm:text-lg lg:text-xl font-bold">
            FaceID Assistant
          </Link>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="flex flex-1 justify-center items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md flex flex-col gap-4 sm:gap-6">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
            <div className="text-base sm:text-lg lg:text-xl font-semibold text-neutral-400">
              AUTHENTICATION REQUIRED
            </div>
            
            <div className="flex flex-row items-start gap-1 sm:gap-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                Good to See You Again
              </h1>
              <span className="text-lime-400 text-2xl sm:text-3xl lg:text-4xl font-semibold">
                !
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-400">
                New here? Create an account.
              </h2>
              <Link
                href="/signup"
                className="text-lime-400 hover:text-lime-300 transition font-medium font-semibold underline text-sm sm:text-base lg:text-lg"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Form - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-5 mt-2 sm:mt-4">
            {/* Email Input */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-white bg-black border border-neutral-400 focus:border-lime-400 transition focus:outline-none rounded-xl placeholder-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 pr-12 border border-neutral-400 focus:border-lime-400 rounded-xl transition focus:outline-none placeholder-neutral-400 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-lime-400 transition disabled:opacity-50 p-1"
              >
                {showPassword ? (
                  <EyeOff size={18} className="sm:w-5 sm:h-5" />
                ) : (
                  <Eye size={18} className="sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                onClick={handleSubmit}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-lime-400 text-black rounded-xl hover:bg-lime-300 active:bg-lime-500 transition font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log in
              </button>
              <p className="text-neutral-500 text-xs sm:text-sm mt-4 sm:mt-8 text-center px-4">
                Log in to access your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Logo - Hidden on mobile, visible on large screens */}
      <div className="hidden lg:flex justify-end items-end p-4">
        <Radar className="w-8 h-8 text-lime-400" />
      </div>
    </div>
  );
}