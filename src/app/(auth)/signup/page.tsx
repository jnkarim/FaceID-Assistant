"use client";

import { Eye, EyeOff, Radar } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Signup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/users/signup", formData);
      router.push("/login");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log("Signup failed", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
      {/* Header - Mobile Optimized */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between sm:justify-center border-b border-black lg:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Radar className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
          <div className="text-white text-base sm:text-lg lg:text-xl font-bold">
            FaceID Assistant
          </div>
        </Link>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4">
          {/* Header Section */}
          <div className="text-center">
            <div className="text-base sm:text-lg lg:text-xl font-semibold text-neutral-400 mb-2">
              START FOR FREE
            </div>
            
            <div className="flex flex-row justify-center items-center gap-2 mb-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                Create new account
              </h1>
              <span className="w-2 h-2 bg-lime-400 rounded-full mt-1 sm:mt-2" />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-neutral-400">
                Already a member?
              </h2>
              <Link
                href="/login"
                className="text-lime-400 hover:text-lime-300 transition font-medium font-semibold underline text-sm sm:text-base lg:text-lg"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Form - Mobile Optimized */}
          <div className="w-full space-y-4 sm:space-y-5 mt-2 sm:mt-4">
            {/* First Name & Last Name */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 text-white border border-neutral-400 focus:border-lime-400 rounded-xl transition placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              <input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 text-white border border-neutral-400 focus:border-lime-400 rounded-xl transition placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
            </div>

            {/* Email */}
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 text-white border border-neutral-400 focus:border-lime-400 transition rounded-xl placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            />

            {/* Password */}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 pr-12 text-white border border-neutral-400 focus:border-lime-400 transition rounded-xl placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
            <div className="pt-2 sm:pt-3">
              <button
                onClick={handleSubmit}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-lime-400 text-black rounded-xl hover:bg-lime-300 active:bg-lime-500 transition font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>

            {/* Terms Text */}
            <p className="text-neutral-500 text-xs sm:text-sm text-center px-2 sm:px-4">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
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