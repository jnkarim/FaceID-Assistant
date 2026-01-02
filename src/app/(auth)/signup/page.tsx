/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Eye, EyeOff, Radar } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await axios.post("/api/users/signup", formData);
    router.push("/onboarding"); 
  } catch (error: any) {
    console.log("Signup failed", error.message);
    alert(error.response?.data?.error || "Signup failed");
  } finally {
    setIsLoading(false);
  }
};



  const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    setIsLoading(true);
    try {
      const userInfoResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );

      const googleUser = userInfoResponse.data;

      const res = await axios.post("/api/users/google-auth", {
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        googleId: googleUser.sub,
        profilePicture: googleUser.picture,
      });

      // Decide where to go based on backend status
      if (res.status === 201) {
        // new Google signup → onboarding
        router.push("/onboarding");
      } else {
        // existing Google user → home
        router.push("/");
      }
    } catch (error: any) {
      console.error("Google authentication failed:", error);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  },
  onError: () => {
    console.log("Google Login Failed");
    alert("Google sign-in failed. Please try again.");
  },
});


  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between sm:justify-center border-b border-black lg:gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Radar className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
          <div className="text-white text-base sm:text-lg lg:text-xl font-bold">
            FaceID Assistant
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4">
          {/* Header Section */}
          <div className="text-center">
            <div className="text-base sm:text-lg lg:text-xl font-semibold text-neutral-400 mb-2">
              Start For Free
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

          {/* Form */}
          <div className="w-full space-y-4 sm:space-y-5 mt-2 sm:mt-4">
            {/* Name Fields */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 text-white border border-neutral-400 focus:border-lime-400 rounded-xl transition placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              <input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
                className="w-full bg-black px-4 sm:px-6 py-3 sm:py-4 pr-12 text-white border border-neutral-400 focus:border-lime-400 transition rounded-xl placeholder-neutral-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
                disabled={isLoading}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-lime-400 text-black rounded-xl hover:bg-lime-300 active:bg-lime-500 transition font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-neutral-700"></div>
              <span className="text-neutral-500 text-sm">or</span>
              <div className="flex-1 h-px bg-neutral-700"></div>
            </div>

            {/* Google Sign-in Button */}
            <div className="flex justify-center">
              <button
                onClick={() => login()}
                disabled={isLoading}
                className="w-2/3 lg:w-1/2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? "Signing in..." : "Sign in with Google"}
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

      {/* Footer Logo */}
      <div className="hidden lg:flex justify-end items-end p-4">
        <Radar className="w-8 h-8 text-lime-400" />
      </div>
    </div>
  );
}
